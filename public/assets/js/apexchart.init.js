/* Template Name: Techwind - Tailwind CSS Multipurpose Landing & Admin Dashboard Template
   Author: Shreethemes
   Email: support@shreethemes.in
   Website: https://shreethemes.in
   Version: 2.0.0
   Created: May 2022
   File Description: For Apex Chart
*/

try {
    var options1 = {
        series: [{
            name: 'Profit',
            data: [500, 653, 548, 482, 553, 570, 560, 610, 580, 854, 945, 1150],
        }, {
            name: 'Expenses',
            data: [246, 379, 521, 453, 243, 264, 333, 246, 468, 222, 456, 789]
        }],
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: false,
                autoSelected: 'zoom'
            },
        },
        grid: {
            strokeDashArray: 5,
      
        },
        plotOptions: {
            bar: {
                borderRadius: 5,
                horizontal: false,
                columnWidth: '40%',
                endingShape: 'rounded'
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        colors: ['#4f46e5', '#10b981'],
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        },
        yaxis: {
            title: {
                text: 'Profit / Expenses (USD)',
    
                style: {
                    colors: ['#8492a6'],
                    fontSize: '16px',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                },
            },
        },
        fill: {
            opacity: 1,
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return "$" + val
                }
            }
        }
    };
    
    var chart1 = new ApexCharts(document.querySelector("#mainchart"), options1);
    chart1.render();
} catch (error) {
    
}