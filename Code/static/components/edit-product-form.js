export default {
    template: `
        <div class='d-flex justify-content-center'>
            <div class="m-3 p-3 bg-light rounded-3" style="width: 50vw;">
                <h3 class="mb-3">Edit Product</h3>
                <label for="product-name" class="form-label">Product Name</label>
                <input type="text" class="form-control mb-3" id="product-name" placeholder="Enter product name" v-model="product.name" required>

                <label for="product-description" class="form-label">Description</label>
                <input type="text" class="form-control mb-3" id="product-description" placeholder="Enter product description" v-model="product.description" required>

                <label for="product-mfg-date" class="form-label">Manufacturing Date</label>
                <input type="date" class="form-control mb-3" id="product-mfg-date" v-model="product.mfg_date" :max="today" required>

                <div class="mb-3 row">
                    <div class="col-7">
                        <label for="product-img-url" class="form-label">Image URL</label>
                        <input type="url" class="form-control mb-1" id="product-img-url" v-model="product.img_url" aria-describedby="basic-addon-url" placeholder="Enter image url" style="width: 100%" required>
                    </div>
                    <div class="col">
                    <img class="img-fluid rounded mx-auto d-block" :src="product.img_url"  style="min-width: 100px; min-height: 100px; max-width: 180px; max-height: 180px; border: 1px solid black; text-align: center; padding-top: 20px" alt="Product Image Preview">
                    </div>
                </div>

                <label for="product-unit" class="form-label">Unit</label>
                <select class="form-select mb-3" id="product-unit" v-model="product.unit" required>
                    <option value="" selected>Select a unit</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="ltr">Litre (ltr)</option>
                    <option value="pc">Piece (pc)</option>
                </select>

                <div class="mb-3">
                    <label for="product-rate-per-unit" class="form-label">Rate Per Unit</label>
                    <div class="input-group ">
                        <span class="input-group-text">₹</span>
                        <input type="number" class="form-control" id="product-rate-per-unit" placeholder="Enter product rate" v-model="product.rate_per_unit" min="0" required>
                        <span class="input-group-text">/ {{product.unit}}</span>
                    </div>
                </div>

                <div class="mb-3">
                    <label for="product-available-stock" class="form-label">Available Stock</label>
                    <div class="input-group">
                        <input type="number" class="form-control" id="product-available-stock" placeholder="Enter available stock" v-model="product.available_stock" min="0" required>
                        <span class="input-group-text">{{product.unit}}</span>
                    </div>
                </div>

                <label for="product-category" class="form-label">Category</label>
                <select class="form-select mb-3" id="product-category" v-model="product.category" required>
                    <option value="">Select a category</option>
                    <option v-for="(category, index) in categories" :key="index" :value="category.name">{{category.name}}</option>
                </select>

                <div class="mb-3 text-danger" v-if="error">* {{error}}</div>

                <button class="btn btn-primary" type="submit" @click="editProduct()">Edit Product</button>
            </div>
        </div>
    `,
    
    data() {
        return {
            product: {
                name: null,
                description: null,
                mfg_date: null,
                img_url: null,
                rate_per_unit: null,
                unit: null,
                available_stock: null,
                category: ""
            },
            categories: [],
            error: null
        }
    },

    computed: {
        today() {
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            return yyyy + '-' + mm + '-' + dd;
        }
    },

    methods: {
        async editProduct() {
            const response = await fetch(`/api/v1/product/${this.$route.params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                },
                body: JSON.stringify(this.product)
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                this.$router.push({ path: '/' });
            } else {
                this.error = data.message;
            }
        }
    },

    async mounted() {
        const cat_response = await fetch('/api/v1/category', {
            headers: {
                'Authentication-Token': sessionStorage.getItem('auth-token')
            }
        });
        if (cat_response.ok) {
            const data = await cat_response.json();
            this.categories = data;
        } else {
            this.error = data.message;
        }

        const prod_response = await fetch(`/api/v1/product/${this.$route.params.id}`, {
            headers: {
                'Authentication-Token': sessionStorage.getItem('auth-token')
            }
        });
        if (prod_response.ok) {
            const data = await prod_response.json();
            data.category = data.category.name;
            this.product = data;
        } else {
            this.error = data.message;
        }
    }
}