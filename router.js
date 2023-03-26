import { createRouter, createWebHashHistory } from 'vue-router';
const routes = [
	{ path: '/', redirect: '/login' },
	{ path: '/login', component: () => import('/src/view/login.vue') },
	{
		path: '/index',
		component: () => import('/src/view/index.vue'),
		children: [
      
		],
	},
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

export default router;
