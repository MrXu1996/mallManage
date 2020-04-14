<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRole">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开项 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['vcenter','bdbottom', i1 === 0 ? 'bdtop' : '']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRight(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="['vcenter', i2 !== 0 ? 'bdtop' : '']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRight(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      :class="[i3 !== 0 ? 'bdtop' : '']"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRight(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引项 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editRole(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRoleInfo(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRight(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="角色名" prop="roleName" label-width="80px">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" label-width="80px">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="checkRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="角色名" prop="roleName" label-width="80px">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" label-width="80px">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <el-tree
        :data="rigthsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      // 所有角色的数据
      roleList: [],
      // 所有权限的数据
      rigthsList: [],
      addDialogVisible: false,
      editDialogVisible: false,
      setRightDialogVisible: false,
      addForm: {
        roleName: "",
        roleDesc: ""
      },
      editForm: {
        roleName: "",
        roleDesc: ""
      },
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          { min: 0, max: 20, message: "长度在 0 到 20 个字符", trigger: "blur" }
        ]
      },
      treeProps: {
        label: "authName",
        children: "children"
      },
      defKeys: [],
      roleId: ''
    };
  },
  components: {},
  methods: {
    getRoleList() {
      this.$http
        .get("roles")
        .then(res => {
          this.roleList = res.data.data;
        })
        .catch(() => {
          this.$message.error("获取角色列表失败!");
        });
    },
    addRole() {
      this.addDialogVisible = !this.addDialogVisible;
    },
    // 监听对话框关闭，重置表单
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    setRightDialogClosed() {
      // 关闭对话框时重置defKeys数组
      this.defKeys = []
    },
    // 表单预校验
    checkRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        // 可以发起添加新用户的网络请求
        const { data: res } = await this.$http.post("roles", this.addForm);
        if (res.meta.status !== 201) return this.$message.error("添加角色失败");
        this.$message.success("添加角色成功");
        this.addDialogVisible = false;
        this.getRoleList();
      });
    },
    editRoleInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        // 可以发起修改用户的网络请求
        const { data: res } = await this.$http.put(
          "roles/" + this.editForm.roleId,
          { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc }
        );
        if (res.meta.status !== 200)
          return this.$message.error("修改角色信息失败");
        this.$message.success("修改角色信息成功");
        this.editDialogVisible = false;
        this.getRoleList();
      });
    },
    //修改用户信息
    async editRole(id) {
      this.editDialogVisible = !this.editDialogVisible;
      const { data: res } = await this.$http.get(`roles/${id}`);
      if (res.meta.status !== 200) return this.$message.error("查询用户失败");
      this.editForm = res.data;
    },
    // 根据id删除用户信息
    removeRoleInfo(id) {
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http
            .delete("roles/" + id)
            .then(() => {
              this.$message.success("删除成功!");
              this.getRoleList();
            })
            .catch(() => {
              this.$message.error("删除失败!");
            });
        })
        .catch(() => {
          this.$message.info("已取消删除!");
        });
    },
    // 删除权限
    removeRight(role, rightId) {
      this.$confirm("此操作将永久删除该权限, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http
            .delete(`roles/${role.id}/rights/${rightId}`)
            .then(res => {
              this.$message.success("删除成功!");
              // this.getRoleList();
              role.children = res.data.data;
            })
            .catch(() => {
              this.$message.error("删除失败!");
            });
        })
        .catch(() => {
          this.$message.info("已取消删除!");
        });
    },
    // 权限对话框
    showSetRight(role) {
      // 保存角色权限id
      this.roleId = role.id
      // 获取所有权限数据
      this.$http
        .get("rights/tree")
        .then(res => {
          this.rigthsList = res.data.data;
        })
        .catch(() => {
          this.$message.error("获取权限列表失败!");
        });
      // 调用获取权限id函数
      this.getLeafKeys(role, this.defKeys);
      // 显示隐藏对话框
      this.setRightDialogVisible = !this.setRightDialogVisible;
    },
    // 通过递归函数获取所有三级权限的id
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }

      node.children.forEach(item => {
        this.getLeafKeys(item, arr);
      });
    },
    // 点击确定分配权限
    allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      .then( res => {
        this.$message.success('分配权限成功!')
        this.getRoleList()
        this.setRightDialogVisible = false
      })
      .catch(() => {
        this.$message.error('分配权限失败!')
      })
    }
  },
  created() {
    this.getRoleList();
  }
};
</script>

<style scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>