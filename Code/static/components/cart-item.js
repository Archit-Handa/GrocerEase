export default {
    template: `
        <div class="col m-3 p-3 bg-body-secondary rounded-3">
            <div class="row">
                <div class="col-5">
                    <img :src="product.img_url" :alt="product.name + ' Image'" class="rounded-3" style="height: 100%; width: 100%; object-fit: cover;">
                </div>
                <div class="col p-2">
                    <div class="row">
                        <span class="col fw-semibold">{{product.name}}</span> <span class="col text-end">{{quantity}} {{product.unit}}</span>
                    </div>
                    <div class="row">
                        <span class="col">₹ {{product.rate_per_unit}} / {{product.unit}}</span>
                    </div>
                    <div class="row">
                        <span class="col fw-semibold">Subtotal:</span> <span class="col fw-semibold text-end">₹ {{quantity * product.rate_per_unit}}</span>
                    </div>
                    <div class="row">
                        <span class="col text-danger fw-medium">{{cartItem.limited_stock ? 'Limited Stock' : ''}}</span>
                    </div>
                </div>
            </div>
        </div>
    `,

    props: ['cartItem'],

    computed: {

        product() {
            return this.$store.state.products.find(product => product.id === this.cartItem.id);
        },

        quantity() {
            return this.cartItem.quantity;
        }
    }
}