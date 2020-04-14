<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 添加分类区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCategory">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表区域 -->
      <table-tree
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        class="table-tree"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            style="color: lightgreen"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="editCate(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="error"
            icon="el-icon-delete"
            @click="removeCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </table-tree>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name" clearable></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <el-cascader
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <el-form
        :model="editCateForm"
        :rules="addCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Categories",
  data() {
    return {
      cateList: [],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          type: "template",
          template: "isok"
        },
        {
          label: "排序",
          type: "template",
          template: "order"
        },
        {
          label: "操作",
          type: "template",
          template: "opt"
        }
      ],
      addDialogVisible: false,
      editDialogVisible: false,
      addCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0
      },
      editCateForm: {
        cat_name: ""
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      parentCateList: [],
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      selectedKeys: []
    };
  },
  components: {},
  methods: {
    getCateList() {
      this.$http
        .get("categories", { params: this.queryInfo })
        .then(res => {
          this.cateList = res.data.data.result;
          this.total = res.data.data.total;
        })
        .catch(() => {
          this.$message.error("获取商品失败!");
        });
    },
    // 监听pagesize改变的事件
    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`);
      this.queryInfo.pagesize = val;
      this.getCateList();
    },
    // 监听当前页改变的事件
    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`);
      this.queryInfo.pagenum = val;
      this.getCateList();
    },
    // 添加分类按钮
    addCategory() {
      this.getParentCateList();
      this.addDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        this.$message.error("获取数据失败！");
      }

      this.parentCateList = res.data;
    },
    // 选择项发生变化
    parentCateChanged() {
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    addCate() {
      this.$refs.addCateFormRef.validate(valid => {
        if (!valid) return;

        this.$http
          .post("categories", this.addCateForm)
          .then(res => {
            this.$message.success("添加分类成功!");
            this.getCateList();
            this.addDialogVisible = false;
          })
          .catch(() => {
            this.$message.error("添加分类失败！");
          });
      });
    },
    // 对话框关闭重置表单
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields();
    },
    // 编辑分类信息
    editCateInfo() {
      this.$refs.editCateFormRef.validate(valid => {
        if (!valid) return;

        this.$http
          .put(`categories/` + this.editCateForm.cat_id, {
            cat_name: this.editCateForm.cat_name
          })
          .then(res => {
            this.$message.success("修改分类信息成功!");
            this.editDialogVisible = false;
            this.getCateList();
          })
          .catch(() => {
            this.$message.error("修改分类信息失败!");
          });
      });
    },
    // 查询分类信息
    editCate(id) {
      this.editDialogVisible = true;
      this.$http
        .get(`categories/${id}`)
        .then(res => {
          this.editCateForm = res.data.data;
        })
        .catch(() => {
          this.$message.error("查询分类信息失败!");
        });
    },
    // 删除分类信息
    removeCate(id) {
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http
            .delete(`categories/${id}`)
            .then(() => {
              this.$message.success("删除成功!");
              this.getCateList();
            })
            .catch(() => {
              this.$message.error("删除失败!");
            });
        })
        .catch(() => {
          this.$message.info("已取消删除!");
        });
    }
  },
  created() {
    this.getCateList();
  }
};
</script>

<style scoped>
.table-tree {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
.el-cascader-menu {
  height: 200px !important;
}
</style>