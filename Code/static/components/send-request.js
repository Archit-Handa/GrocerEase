export default {
    template: `
        <div class='d-flex justify-content-center'>
            <div class="m-3 p-3 bg-light rounded-3" style="width: 50vw;">
                <h3 class="mb-3">Raise Request</h3>
                <p class="form-label">Request Type</p>
                <div class="mb-3" id="request-type">
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="request-type" id="change-request-type" v-model="request.type" value="change" required>
                        <label class="form-check-label" for="change-request-type">Change</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="role" id="delete-request-type" v-model="request.type" value="delete" required>
                        <label class="form-check-label" for="delete-request-type">Delete</label>
                    </div>
                </div>

                <div  v-if="request.type === 'change'">
                    <div class="mb-3">
                        <label for="old-category-name" class="form-label">From</label>
                        <select class="form-select mb-3" id="old-category-name" v-model="request.oldName" required>
                            <option value="">Select old category name</option>
                            <option v-for="(category, index) in categories" :key="index" :value="category.name">{{category.name}}</option>
                        </select>
                    </div>
                    
                    <label for="new-category-name" class="form-label">To</label>
                    <input type="text" class="form-control mb-3" id="new-category-name" placeholder="Enter new category name" v-model="request.newName" required>
                </div>
                
                <div v-else class="mb-3">
                    <label for="old-category-name" class="form-label">Category</label>
                    <select class="form-select mb-3" id="old-category-name" v-model="request.oldName" required>
                        <option value="">Select category name</option>
                        <option v-for="(category, index) in categories" :key="index" :value="category.name">{{category.name}}</option>
                    </select>
                </div>

                <div class="mb-3 text-danger" v-if="error">* {{error}}</div>

                <button class="btn btn-primary" type="submit" @click="sendRequest()">Send Request</button>
            </div>
        </div>
    `,

    data() {
        return {
            request: {
                type: 'change',
                oldName: '',
                newName: '',
            },
            categories: [],
            error: null
        }
    },

    methods: {
        async sendRequest() {
            if (this.request.type === 'change' && this.request.oldName === '') {
                this.error = 'Please select old category name';
                return;
            }

            if (this.request.type === 'change' && this.request.newName === '') {
                this.error = 'Please enter new category name';
                return;
            }

            if (this.request.type === 'delete' && this.request.oldName === '') {
                this.error = 'Please select category name';
                return;
            }

            const formattedRequest = {
                initiator_id: sessionStorage.getItem('user-id'),
                category: this.request.oldName,
                request_details: this.request.type === 'change' ? this.request.type + ' "' + this.request.oldName + '" to "' + this.request.newName + '"' : this.request.type + ' "' + this.request.oldName + '"'
            }

            const response = await fetch('/api/v1/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                },
                body: JSON.stringify(formattedRequest)
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
        const response = await fetch('/api/v1/category', {
            headers: {
                'Authentication-Token': sessionStorage.getItem('auth-token')
            }
        });
        if (response.ok) {
            const data = await response.json();
            this.categories = data;
        } else {
            this.error = response.status + " " + response.statusText;
        }
    }
}