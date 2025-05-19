<template>
  <div class="force-reset">
    <el-image fit="cover" :src="bg"
      style="width: 100%; height: 100%; position: absolute; left: 0; top: 0; object-fit: cover;" />

    <div class="resetPart">
      <h2>首次登录，请重设信息，邮箱正确可略过</h2>
      <el-form :model="resetForm" :rules="rules" ref="resetFormRef" label-width="100px">
        <el-form-item label="新邮箱" prop="email">
          <el-input v-model="resetForm.email" placeholder="邮箱正确可不修改" clearable></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input type="password" v-model="resetForm.password" placeholder="请输入新密码" show-password clearable></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input type="password" v-model="resetForm.confirmPassword" placeholder="请确认新密码" show-password clearable></el-input>
        </el-form-item>
        <el-button class="btn" type="primary" @click="handleReset">提交</el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import bg from "@/assets/bg.png";
import { fetchCurrentUser, logout } from "@/utils/user";

const resetForm = ref({
  email: "",
  password: "",
  confirmPassword: "",
});

const resetFormRef = ref(null);

const rules = {
  email: [
    { required: true, message: "请输入新邮箱", trigger: "blur" },
    { type: "email", message: "邮箱格式不正确", trigger: ["blur", "change"] },
  ],
  password: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度至少6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== resetForm.value.password) {
          callback(new Error("两次密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

const handleReset = async () => {
  try {
    await resetFormRef.value.validate();
    await request.post("/auth/force-reset", resetForm.value);
    ElMessage.success("修改成功，请重新登录");
    logout();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || "修改失败");
  }
};

onMounted(() => {
  fetchCurrentUser().then((user) => {
      resetForm.value.email = user.email;
    })
    .catch((error) => {
      ElMessage.error("获取用户信息失败");
      console.error(error);
    });
});
</script>

<style scoped>
.force-reset {
  height: calc(100vh);
  width: calc(100vw);
  position: relative;
}

.resetPart {
  position: absolute;
  top: 50%;
  left: 30%;
  transform: translate(-50%, -50%);
  width: 450px;
  padding: 50px;
  background: #f6f8fa;
  box-sizing: border-box;
  box-shadow: 0px 15px 25px rgba(0, 0, 0, 0.5);
  border-radius: 15px;
}

h2 {
  margin: 0 0 30px;
  padding: 0;
  color: black;
  text-align: center;
}

.btn {
  transform: translate(170px);
  width: 80px;
  height: 40px;
  font-size: 15px;
}
</style>