export default {
    template: `
        <div class="row bg-body-secondary m-3 p-3 rounded-3">
            <div class="col">
                <p class="h5" :class="{'fw-bolder' : !request.is_approved, 'fw-normal': request.is_approved}">Request ID: {{request.id}}</p>
                <span class="h6">Initiator:</span> {{request.initiator.username}}
                &emsp;
                <span class="h6">Initiated on:</span> {{request_date}}
                &emsp;
                <span class="m-1 badge text-bg-danger" v-if="!request.is_approved">Pending Approval {{userRole === 'store_manager' ? 'by Admin' : ''}}</span>
                <span class="m-1 badge text-bg-success" v-else>Approved {{userRole === 'store_manager' ? 'by Admin' : ''}}</span>
                <p>{{request.request_details}}</p>
            </div>
            <div class="col-3 p-4 text-center" v-if="userRole === 'admin'" v-show="!request.is_approved">
                <button class="btn btn-success" @click="approveRequest()">Approve</button>
                <button class="btn btn-danger" @click="declineRequest()">Decline</button>
            </div>
        </div>
    `,

    props: ['request'],

    data() {
        return {
            userRole: sessionStorage.getItem('role')
        }
    },

    computed: {
        request_date() {
            return new Date(this.request.request_date).toLocaleDateString('en-GB');
        }
    },

    methods: {
        async approveRequest() {
            const result = confirm('Are you sure you want to approve this request?');
            if (result) {
                const response = await fetch(`/api/v1/request/${this.request.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authentication-Token': sessionStorage.getItem('auth-token')
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Request approved')
                    this.$router.go();
                } else {
                    alert(data.message);
                }
            }
        },

        async declineRequest() {
            const response = await fetch(`/api/v1/request/${this.request.id}`, {
                method: 'DELETE',
                headers: {
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                }
            });
            const data = await response.json();
            if (response.ok) {
                alert('Request declined')
                this.$router.go();
            } else {
                alert(data.message);
            }
        }
    }
}