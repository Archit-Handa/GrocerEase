import Request from './request.js';

export default {
    template: `
        <div>
            <h3 class="m-3">See Requests</h3>
            <Request v-for="(request, index) in requests" :key="index" :request="request"/>
            <p v-if="error">{{error}}</p>
        </div>
    `,
    data() {
        return {
            requests: [],
            error: null
        }
    },

    components: {
        Request
    },

    async mounted() {
        const response = await fetch('/api/v1/request', {
            headers: {
                'Authentication-Token': sessionStorage.getItem('auth-token')
            }
        });
        const data = await response.json();
        if (response.ok) {
            this.requests = data.reverse();
        } else {
            this.error = 'No requests';
        }
    }
}