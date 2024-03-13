export default {
    template: `
        <nav class="navbar sticky-top navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">
                    <img :src="'static/images/GrocerEaseIcon.png'" alt="GrocerEase Logo" style="height: 60px">
                    GrocerEase
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div class="navbar-nav">
                        <router-link class="nav-link" to="/">Home</router-link>

                        <router-link class="nav-link" to="/users" v-if="role === 'admin'">All Users</router-link>

                        <router-link class="nav-link" to="/create-category" v-if="role === 'admin' || role === 'store_manager'">Create Category</router-link>

                        <router-link class="nav-link" to="/create-product" v-if="role === 'store_manager'">Create Product</router-link>

                        <router-link class="nav-link" to="/send-request" v-if="role === 'store_manager'">Raise Request</router-link>

                        <router-link class="nav-link" to="/see-request" v-if="role === 'admin' || role === 'store_manager'">See Requests</router-link>

                        <router-link class="nav-link" to="/orders" v-if="role === 'user'">Orders</router-link>

                        <router-link class="nav-link" to="/stats" v-if="role === 'store_manager'">Data and Statistics</router-link>

                        <a class="nav-link" href="#" v-if="isLoggedIn" @click="logout()">Log out</a>
                    </div>
                </div>
            </div>
        </nav>
    `,

    data() {
        return {
            role: sessionStorage.getItem('role'),
            isLoggedIn: sessionStorage.getItem('auth-token') ? true : false
        }
    },

    methods: {
        logout() {
            sessionStorage.removeItem('auth-token');
            sessionStorage.removeItem('role');
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('user-id');
            sessionStorage.removeItem('email');
            this.$store.commit('resetState');
            this.$router.push({path: '/login'});
        }
    }
}