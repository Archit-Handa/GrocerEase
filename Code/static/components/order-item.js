export default {
    template: `
        <div class="row ms-3 me-3 ps-3 pe-3">
            <div class="col">{{item.name}}</div>
            <div class="col">{{item.quantity}} {{item.unit}}</div>
            <div class="col">₹ {{item.rate_per_unit}} / {{item.unit}}</div>
            <div class="col">₹ {{item.quantity * item.rate_per_unit}}</div>
        </div>
    `,

    props: ['item']
}