import Product from './product.js';
import Cart from './cart.js';

export default {
    template: `
        <div>
            <h3 class="m-3">{{username}}'s Dashboard</h3>
            <br>
            <div class="ms-3 me-3">
                <p class="fs-5 fw-semibold text-secondary">Filters:</p>
                <div class="row" id="filter-row">
                    <div class="col">
                        <label class="form-label fw-medium" for="category-filter">Category:</label>
                        <select class="form-select" id="category-filter" v-model="category_filter">
                            <option value="None" selected>All Categories</option>
                            <option v-for="(category, index) in categories" :key="index" :value="category.name">{{category.name}}</option>
                        </select>
                    </div>
                    <div class="col">
                        <label for="max-price" class="form-label"><span class="fw-medium">Max Price:</span>&emsp;₹ {{max_price_filter}}</label>
                        <div class="row">
                            <div class="col-2 text-end">₹ {{min_price}}</div>
                            <div class="col">
                                <input type="range" class="form-range" :min="min_price" :max="max_price" step="1" id="max-price" v-model="max_price_filter">
                            </div>
                            <div class="col-2 text-start">₹ {{max_price}}</div>
                        </div>
                    </div>
                    <div class="col">
                        <label class="form-label fw-medium" for="mfg-date-filter">Manufactured after:</label>
                        <input type="date" class="form-control mb-3" id="mfg-date-filter" v-model="mfg_date_filter" :max="today">
                    </div>
                </div>
            </div>
            <div class="row bg-body-secondary m-3 p-3 rounded-3">
                <div class="row ms-3 me-3 ps-3 pe-3 fs-5">
                    {{products_found_count}} item{{products_found_count != 1 ? 's' : ''}} found
                </div>
                <div class="row">
                    <div class="col">
                        <div class="row align-items-center">
                            <Product v-for="product in products" :key="product.id" :product="product" v-show="isVisible(product)"/>
                        </div>
                    </div>
                    <div class="col m-3 p-3 bg-light rounded-3" style="max-width: 350px">
                        <Cart :key="rerender"/>
                    </div>
                </div>
            </div>
        </div>
    `,

    props: ['categories'],

    data() {
        return {
            username: sessionStorage.getItem('username'),
            rerender: true,
            category_filter: 'None',
            max_price_filter: null,
            mfg_date_filter: null,
            error: null
        };
    },

    watch: {
        "$store.state.cart" : {
            handler() {this.rerender = !this.rerender}
        }
    },

    computed: {
        products_found_count() {
            return this.products.filter(this.isVisible).length;
        },
        min_price() {
            return Math.min(...this.products.map(product => product.rate_per_unit));
        },

        max_price() {
            return Math.max(...this.products.map(product => product.rate_per_unit));
        },

        products() {
            return this.$store.state.products;
        },

        today() {
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            return yyyy + '-' + mm + '-' + dd;
        }
    },

    methods: {
        isVisible(product) {
            return this.satisfyCategoryFilter(product) 
                && this.satisfyMaxPriceFilter(product)
                && this.satisfyMfgDateFilter(product);
        },

        satisfyCategoryFilter(product) {
            if (this.category_filter === 'None') {
                return true;
            } else {
                return product.category.name === this.category_filter;
            }
        },

        satisfyMaxPriceFilter(product) {
            if (this.max_price_filter === null) {
                return true;
            } else {
                return product.rate_per_unit <= this.max_price_filter;
            }
        },

        satisfyMfgDateFilter(product) {
            if (this.mfg_date_filter === null || this.mfg_date_filter === '') {
                return true;
            } else {
                return new Date(product.mfg_date) >= new Date(this.mfg_date_filter);
            }
        }
            
    },

    components: {
        Product,
        Cart
    },

    async mounted() {
        await this.$store.dispatch('fetchProducts');
        await this.$store.dispatch('fetchCart');

        this.max_price_filter = Math.max(...this.products.map(product => product.rate_per_unit));
    }
}