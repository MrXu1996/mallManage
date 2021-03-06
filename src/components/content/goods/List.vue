<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="120px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="80px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="90px">
          <template slot-scope="scope">{{scope.row.add_time * 1000 | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editGoods(scope.row.goods_id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeGoods(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>

    <!-- 修改商品信息的对话框 -->
    <el-dialog
      title="修改商品信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editForm.goods_number" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight" type="number"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoodsInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "",
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [],
      total: 0,
      editDialogVisible: false,
      editForm: {
        goods_name: "",
        goods_price: "",
        goods_number: "",
        goods_weight: ""
      },
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ]
      }
    };
  },
  components: {},
  methods: {
    // 根据分页获取相应的商品列表
    getGoodsList() {
      this.$http
        .get("goods", { params: this.queryInfo })
        .then(res => {
          this.goodsList = res.data.data.goods;
          this.total = res.data.data.total;
        })
        .catch(() => {
          this.$message.error("获取商品列表数据失败!");
        });
    },
    // 监听pagesize改变的事件
    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`);
      this.queryInfo.pagesize = val;
      this.getGoodsList();
    },
    // 监听当前页改变的事件
    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`);
      this.queryInfo.pagenum = val;
      this.getGoodsList();
    },
    // 关闭对话框重置
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改商品
    async editGoods(id) {
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get("goods/" + id);
      if (res.meta.status !== 200) return this.$message.error("查询商品失败!");
      this.editForm = res.data;
    },
    editGoodsInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        // 可以发起修改商品的网络请求
        const { data: res } = await this.$http.put(
          "goods/" + this.editForm.goods_id,
          this.editForm
        );
        if (res.meta.status !== 200)
          return this.$message.error("修改商品信息失败");
        this.$message.success("修改商品信息成功");
        this.editDialogVisible = false;
        this.getGoodsList();
      });
    },
    // 添加商品
    goAddPage() {
      this.$router.push("/goods/add");
    },
    // 删除商品
    removeGoods(id) {
      this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http
            .delete("goods/" + id)
            .then(() => {
              this.$message.success("删除成功!");
              this.getGoodsList();
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
    this.getGoodsList();
  }
};
</script>

<style scoped>
</style>