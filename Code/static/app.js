import router from './router.js'
import store from './store.js'
import Navbar from './components/navbar.js'

router.beforeEach((to, from, next) => {
    if (!(to.name === 'Login' || to.name === 'Signup') && !sessionStorage.getItem('auth-token')) {
        next({ name: 'Login' })
    } else {
        next()
    }
});

const app = new Vue({
    el: '#app',

    template: `
        <div>
            <Navbar :key='rerender'/>
            <router-view class="m-3"/>
        </div>
    `,

    data: {
        rerender: true
    },

    components: {
        Navbar
    },

    watch: {
        $route(to, from) {
            this.rerender = !this.rerender;
        }
    },

    router,

    store
});