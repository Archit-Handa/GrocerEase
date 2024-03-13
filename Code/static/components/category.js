import Product from './product.js';

export default {
    template: `
        <div class="bg-body-secondary m-3 rounded-3">
            <div class="row p-3">
                <div class="col">
                    <p class="h5 m-1">{{category.name}}</p>
                    <p v-if="role !== 'user'" class="text-dark m-1"><span class="h6">Creator:</span> {{category.creator.username}}</p>
                    <p class="m-1 badge text-bg-danger" v-if="!category.is_approved">Pending Approval</p>
                </div>
                <div class="col-3 p-2 text-center" v-if="role === 'admin'">
                    <div v-if="!category.is_approved">
                        <button class="btn btn-success" @click="approveCategory()">Approve</button>
                        <button class="btn btn-danger" @click="declineCategory()">Decline</button>
                    </div>
                    <div v-else>
                        <button class="btn btn-primary" @click="editCategory()">Edit</button>
                        <button class="btn btn-danger" @click="deleteCategory()">Delete</button>
                    </div>
                </div>
            </div>

            <div class="row p-3" v-if="products && products.length > 0">
                <Product v-for="product in products" :key="product.id" :product="product"/>
            </div>
        </div>
    `,

    props: ['category', 'products'],

    data() {
        return {
            role: sessionStorage.getItem('role')
        }
    },

    components: {
        Product
    },

    methods: {
        async approveCategory() {
            const response = await fetch(`/category/${this.category.id}/approve`, {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                }
            });
            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                this.$router.go();
            } else {
                alert(data.message);
            }
        },

        async declineCategory() {
            const response = await fetch(`/category/${this.category.id}/decline`, {
                method: 'DELETE',
                headers: {
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                }
            });
            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                this.$router.go();
            } else {
                alert(data.message);
            }
        },

        async editCategory() {
            this.$router.push({ path: `/edit-category/${this.category.id}` });
        },

        async deleteCategory() {
            const result = confirm('Deleting this category will also delete all of its products. Are you sure you want to delete this category?');
            if (result) {
                const response = await fetch(`/api/v1/category/${this.category.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authentication-Token': sessionStorage.getItem('auth-token')
                    }
                });
                const data = await response.json();
    
                if (response.ok) {
                    alert(data.message);
                    this.$router.go();
                } else {
                    alert(data.message);
                }
            }
        }
    }
}