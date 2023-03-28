<template>
	<div class="loginBackGround">
		<el-header></el-header>
		<el-main class="login-main">
			<div class="loginForm">
				<el-form
					ref="ruleFormRef"
					:model="ruleForm"
					:rules="rules"
					status-icon
					label-width="120px"
					class="demo-ruleForm"
					label-position="top"
				>
					<div class="title">
            <div style="margin-bottom: 1vh;letter-spacing: 2px;">碧桂园园区</div>
          <div style="margin-top: 1vh;letter-spacing: 1px;">违建决策系统</div>
        </div>
					<el-form-item label="用户名" prop="userName">
						<el-input v-model="ruleForm.userName" autocomplete="off" />
					</el-form-item>
					<el-form-item label="密码" prop="password">
						<el-input
							v-model="ruleForm.password"
							type="password"
							autocomplete="off"
						/>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitForm(ruleFormRef)"
							>登录</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-main>
		<el-footer></el-footer>
	</div>
</template>
<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus'
import service from '/utils/request.js';
const router = useRouter();
const ruleFormRef = ref();
const ruleForm = reactive({
	userName: '',
	password: '',
});
const rules = reactive({
	userName: [
		{
			required: true,
			message: '请输入用户名',
			trigger: 'blur',
		},
	],
	password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});

const submitForm = async formEl => {
	if (!formEl) return;
	try {
		//let result = await service.post('User/Login', ruleForm);
		ElMessage.success('登录成功');
		//console.log(result.data);
		//localStorage.setItem('virtual_userToken', result.data.message);
		//localStorage.setItem('virtual_username', ruleForm.userName);
		router.push('/index');
		return true;
	} catch (error) {
		ElMessage.error("用户名或密码错误");
		return false;
	}
};


</script>

<style scoped>
.loginBackGround {
	display: flex;
	flex-direction: column;
	align-items: center;
	height: 100vh;
	width: 100vw;
  background-image: url('/600x450x98c.jpg');
  background-size: cover;
}
.login-main {
	display: flex;
	justify-content: center;
	align-items: center;
}
.loginForm {
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 30px;
	background-color: #ffffffc9;
	height: 50vh;
	width: 50vh;
}
.title{
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  font-size: 25px;
  font-weight: 700;
  padding-bottom: 6vh;
}
</style>
