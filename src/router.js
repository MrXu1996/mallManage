import Vue from 'vue'
import Router from 'vue-router'
import Login from 'components/common/Login'
import Home from 'views/home/Home'
import Welcome from 'views/home/childcomps/Welcome'
import Users from 'components/content/user/Users'
import Rights from 'components/content/power/Rights'
import Roles from 'components/content/power/Roles'
import Categories from 'components/content/goods/Categories'
import Params from 'components/content/goods/Params'

Vue.use(Router)

const router = new Router({
    routes: [{
            path: '/',
            redirect: '/login'
        },
        {
            path: '/login',
            component: Login
        },
        {
            path: '/home',
            component: Home,
            redirect: '/welcome',
            children: [{
                    path: '/welcome',
                    component: Welcome
                },
                {
                    path: '/users',
                    component: Users
                },
                {
                    path: '/rights',
                    component: Rights
                },
                {
                    path: '/roles',
                    component: Roles
                },
                {
                    path: '/categories',
                    component: Categories
                },
                {
                    path: '/params',
                    component: Params
                }
            ]
        }
    ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    // to表示将要访问的路径，from表示从哪个路径跳转而来
    // next是一个函数表示放行，next() / next('/login')强制跳转
    if (to.path === '/login') return next();
    // 获取taken
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
})

export default router