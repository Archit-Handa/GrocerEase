import User from './user.js'

export default {
    template: `
        <div>
            <h3 class="m-3">All Users</h3>
            <div v-if="error">{{error}}</div>
            <User :users="all_users['admin']" role="Admin"/>
            <hr class="border border-secondary border-1 opacity-50">
            <User :users="all_users['store managers']" role="Store Managers"/>
            <hr class="border border-secondary border-1 opacity-50">
            <User :users="all_users['users']" role="Users"/>
        </div>
    `,

    data() {
        return {
            all_users: {
                'users': [],
                'store managers': [],
                'admin': []
            },
            error: null
        }
    },

    components: {
        User
    },

    async mounted() {
        const response = await fetch('/users', {
            headers: {
                'Authentication-Token': sessionStorage.getItem('auth-token')
            }
        });
        if (response.ok) {
            const data = await response.json();
            this.all_users = data;
        } else {
            this.error = response.status + " " + response.statusText;
        }
    }
}