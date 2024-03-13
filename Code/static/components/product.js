export default {
    template: `
        <div class="card m-3 p-3" style="width: 16rem;">
            <img :src="product.img_url" class="card-img-top" :alt="product.name + ' Image'" style="height: 170px; object-fit: cover;">
            <div class="card-body" style="height: 320px">
                <h5 class="card-title">{{product.name}}</h5>
                <p class="card-text">{{product.description}}</p>
                <p class="card-text"><span class="fw-semibold">Mfg Date:</span> {{mfg_date}}</p>
                <p class="card-text"><span class="fw-semibold">Price:</span> ₹ {{product.rate_per_unit}} per {{product.unit}}</p>
                <p class="card-text"><span class="fw-semibold">Available:</span> {{product.available_stock}} {{product.unit}}</p>

                <div v-if="userRole === 'user'">
                    <button class="btn btn-primary" v-if="quantity == 0" :disabled="product.available_stock === 0" @click="qty++">{{product.available_stock > 0 ? 'Add to Cart' : 'Out of Stock' }}</button>
                    <div v-else>
                        <button class="btn btn-primary fw-bolder" @click="qty--" :disabled="quantity == 0">−</button>
                        <button class="btn btn-light text-dark" disabled>{{quantity}} {{product.unit}}</button>
                        <button class="btn btn-primary fw-bolder" @click="qty++" :disabled="quantity == limit">+</button>
                    </div>
                </div>
                
                <div v-if="userRole === 'store_manager'">
                    <button class="btn btn-primary" @click="editProduct(product.id)">Edit</button>
                    <button class="btn btn-danger" @click="deleteProduct(product.id)">Delete</button>
                    <p v-if="product.available_stock === 0" class="alert alert-danger mt-2 p-1" role="alert"><i class="bi bi-exclamation-circle-fill"></i> Out of Stock</p>
                </div>
            </div>
        </div>
    `,

    props: ['product'],

    data() {
        return {
            userRole: sessionStorage.getItem('role'),
            qty: 0
        }
    },

    watch: {
        qty(newQuantity) {
            this.rerender = !this.rerender;
            this.qty = newQuantity;
            if (newQuantity > this.limit) {
                this.qty = this.limit;
            }
            if (newQuantity < 0) {
                this.qty = 0;
            }

            this.$store.commit('updateCart', { 'id': this.product.id, 'quantity': this.qty });
        }
    },

    computed: {
        quantity() {
            const val = this.$store.getters.getItemQuantity(this.product.id);
            this.qty = val;
            return val;
        },

        mfg_date() {
            return new Date(this.product.mfg_date).toLocaleDateString('en-GB');
        },

        limit() {
            return Math.min(15, this.product.available_stock);
        }
    },

    methods: {
        editProduct(id) {
            this.$router.push({ path: `/edit-product/${id}` });
        },

        async deleteProduct(id) {
            const result = confirm('Are you sure you want to delete this product?');
            if (result) {
                const response = await fetch(`/api/v1/product/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authentication-Token': sessionStorage.getItem('auth-token')
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    this.$router.go();
                    alert(data.message);
                } else {
                    alert(data.message);
                }
            }
        }
    }
}