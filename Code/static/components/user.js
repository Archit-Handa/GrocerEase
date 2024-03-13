export default {
    template: `
        <div v-if="users.length > 0" class="bg-body-tertiary mb-3 mt-3 pb-1 pt-1 rounded-3">
            <h4 class="m-3">{{role}}</h4>
            <div v-for="(user, index) in users" class="bg-body-secondary m-3 p-2 row rounded-3">
                <div class="col-10 p-1">
                    <p class="h5 m-1">{{user.username}}</p>
                    <p class="m-1 text-secondary"><span class="h6">Email:</span> {{user.email}}</p>
                    <p class="m-1 badge text-bg-warning" v-if="!user.active">Pending Activation</p>
                    <p class="m-1 badge text-bg-success" v-else>Active</p>
                </div>
                <div class="col p-4 text-center">
                    <button class="btn btn-success" v-if="!user.active" @click="activate(user.id)">Activate</button>
                    <button class="btn btn-danger" v-if="user.role === 'store_manager' &&  user.active" @click="activate(user.id)">Deactivate</button>
                    <button class="btn btn-success" v-if="user.role === 'admin' || user.role === 'user'" disabled>Activated</button>
                </div>
            </div>
        </div>
    `,

    props: ['users', 'role'],

    methods: {
        async activate(id) {
            const response = await fetch(`/activate/store_manager/${id}`, {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                }
            });
            const data = await response.json();
            if (response.ok) {
                this.$router.go();
                alert(data.message);
            } else {
                alert(response.status + " " + response.statusText);
            }
        }
    }
}