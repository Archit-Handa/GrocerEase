export default {
    template: `
        <div class='d-flex justify-content-center'>
            <div class="m-3 p-3 bg-light rounded-3" style="width: 50vw;">
                <h3 class="mb-3">Create Category</h3>
                <label for="category-name" class="form-label">Category Name</label>
                <input type="text" class="form-control mb-3" id="category-name" placeholder="Enter category name" v-model="category.name">
                <div class="mb-3 text-danger" v-if="error">* {{error}}</div>
                <button class="btn btn-primary" @click="createCategory()">Create Category</button>
            </div>
        </div>
    `,

    data() {
        return {
            category: {
                name: null
            },
            error: null
        }
    },

    methods: {
        async createCategory() {
            const response = await fetch('/api/v1/category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                },
                body: JSON.stringify(this.category)
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                this.$router.push({ path: '/' });
            } else {
                this.error = data.message;
            }
        }
    }
}