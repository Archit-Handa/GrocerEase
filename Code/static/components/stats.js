google.charts.load("current", { packages: ["corechart"] });

export default {
    template: `
        <div>
            <div>
                <h3 class="ms-3 me-3">Data and Summary Statistics</h3>
                <hr class="border border-secondary border-1 opacity-50">
                <div>
                    <span class="fs-5 ms-3">Download Inventory Data:</span>
                    <button class="btn btn-primary ms-2 me-1 fw-bold" @click="downloadInventoryCSV()"><i class="bi bi-filetype-csv"></i> CSV</button>
                    <span v-if="isWaitingCSV">Waiting for download...</span>
                    <button class="btn btn-primary ms-1 me-3 fw-bold" @click="downloadInventoryExcel()"><i class="bi bi-filetype-xlsx"></i> XLSX</button>
                    <span v-if="isWaitingExcel">Waiting for download...</span>
                    <span class="text-danger" v-if="error">{{error}}</span>
                </div>
            </div>
            <div class="bg-body-secondary rounded-3 m-3 p-3 h4">Statistics by Category</div>
            <div class="row" style="height: 400px;">
                <div id="salesChartByCategory" class="col"></div>
                <div id="revenueChartByCategory" class="col"></div>
            </div>
            <div class="row"></div>
            <div class="bg-body-secondary rounded-3 m-3 p-3 h4">Statistics by Product</div>
            <div class="row" style="height: 400px;">
                <div id="salesChartByProduct" class="col"></div>
                <div id="revenueChartByProduct" class="col"></div>
            </div>
        </div>
    `,

    data() {
        return {
            isWaitingCSV: false,
            isWaitingExcel: false,
            error: null
        }
    },

    methods: {
        async downloadInventoryCSV() {
            this.isWaitingCSV = true;
            const response = await fetch('/download-inventory-csv', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                }
            });
            const data = await response.json();
            if (response.ok) {
                const taskId = data['task-id'];
                const interval = setInterval(async () => {
                    const inventory_response = await fetch(`/get-inventory/${taskId}`, {
                        headers: {
                            'Authentication-Token': sessionStorage.getItem('auth-token')
                        }
                    });
                    if (inventory_response.status === 200) {
                        clearInterval(interval);
                        this.isWaitingCSV = false;
                        window.location.href = `/get-inventory/${taskId}`;
                    } else if (inventory_response.status !== 202) {
                        clearInterval(interval);
                        this.isWaitingCSV = false;
                        this.error = 'Some error has occurred.';
                    }
                }, 1000);
            }
        },

        async downloadInventoryExcel() {
            this.isWaitingExcel = true;
            const response = await fetch('/download-inventory-excel', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                }
            });
            const data = await response.json();
            if (response.ok) {
                const taskId = data['task-id'];
                const interval = setInterval(async () => {
                    const inventory_response = await fetch(`/get-inventory/${taskId}`, {
                        headers: {
                            'Authentication-Token': sessionStorage.getItem('auth-token')
                        }
                    });
                    if (inventory_response.status === 200) {
                        clearInterval(interval);
                        this.isWaitingExcel = false;
                        window.location.href = `/get-inventory/${taskId}`;
                    } else if (inventory_response.status !== 202) {
                        clearInterval(interval);
                        this.isWaitingExcel = false;
                        this.error = 'Some error has occurred.';
                    }
                }, 1000);
            }
        },

        async drawSalesChartByCategory() {
            const response = await fetch('/api/v1/sales/category', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                }
            });
            const response_data = await response.json();
            if (response.ok) {
                let sales_data = [['Category', 'Sales']];
                for (const key in response_data) {
                    sales_data.push([key, response_data[key]]);
                }
        
                const data = google.visualization.arrayToDataTable(sales_data);
            
                const options = {
                    title: 'Sales by Category (in units)',
                    pieHole: 0.4,
                };
            
                const chart = new google.visualization.PieChart(document.getElementById('salesChartByCategory'));
                chart.draw(data, options);
            } else {
                document.getElementById('salesChartByCategory').innerHTML = 'No Sales Data Available'
            }
        },
        
        async drawRevenueChartByCategory() {
            const response = await fetch('/api/v1/revenue/category', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                }
            });
            const response_data = await response.json();
            if (response.ok) {
                let revenue_data = [['Category', 'Revenue']];
                for (const key in response_data) {
                    revenue_data.push([key, response_data[key]]);
                }
        
                const data = google.visualization.arrayToDataTable(revenue_data);
            
                const options = {
                    title: 'Revenue by Category (in ₹)',
                    pieHole: 0.4,
                };
            
                const chart = new google.visualization.PieChart(document.getElementById('revenueChartByCategory'));
                chart.draw(data, options);
            } else {
                document.getElementById('revenueChartByCategory').innerHTML = 'No Revenue Data Available'
            }
        },
        
        async drawSalesChartByProduct() {
            const response = await fetch('/api/v1/sales/product', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                }
            });
            const response_data = await response.json();
            if (response.ok) {
                let sales_data = [['Product', 'Sales']];
                for (const key in response_data) {
                    sales_data.push([key, response_data[key]]);
                }
        
                const data = google.visualization.arrayToDataTable(sales_data);
            
                const options = {
                    title: 'Sales by Product (in units)',
                    pieHole: 0.4,
                };
            
                const chart = new google.visualization.PieChart(document.getElementById('salesChartByProduct'));
                chart.draw(data, options);
            } else {
                document.getElementById('salesChartByProduct').innerHTML = 'No Sales Data Available'
            }
        },
        
        async drawRevenueChartByProduct() {
            const response = await fetch('/api/v1/revenue/product', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                }
            });
            const response_data = await response.json();
            if (response.ok) {
                let revenue_data = [['Product', 'Revenue']];
                for (const key in response_data) {
                    revenue_data.push([key, response_data[key]]);
                }
        
                const data = google.visualization.arrayToDataTable(revenue_data);
            
                const options = {
                    title: 'Revenue by Product (in ₹)',
                    pieHole: 0.4,
                };
            
                const chart = new google.visualization.PieChart(document.getElementById('revenueChartByProduct'));
                chart.draw(data, options);
            } else {
                document.getElementById('revenueChartByProduct').innerHTML = 'No Revenue Data Available'
            }
        }
    },

    mounted() {
        google.charts.setOnLoadCallback(() => this.drawSalesChartByCategory());
        google.charts.setOnLoadCallback(() => this.drawRevenueChartByCategory());
        google.charts.setOnLoadCallback(() => this.drawSalesChartByProduct());
        google.charts.setOnLoadCallback(() => this.drawRevenueChartByProduct());
    }
};