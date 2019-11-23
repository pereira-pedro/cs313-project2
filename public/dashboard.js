const url = window.location.hostname.startsWith("localhost")
    ? "http://localhost:3000"
    : "https://enigmatic-headland-55249.herokuapp.com/";

$(document).ready(() => {
    const companies = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: `${url}/query?keyword=%QUERY`,
            wildcard: '%QUERY',
            transform: (data) => {
                var newData = [];
                data.bestMatches.forEach((item) => {
                    newData.push({ 'name': item['2. name'], 'value': item['1. symbol'] });
                });
                return newData;
            }
        },
        identify: function (response) {
            return response.name;
        }
    });

    const c = $('#company');
    c.typeahead(null, {
        name: 'companies',
        source: companies,
        display: () => {
            return '';
        },
        limit: 10,
        templates: {
            suggestion: (item) => {
                return `<div><b>${item.value}</b> - ${item.name}</div>`;
            },
            pending: (query) => {
                return '<div class="tt-suggestion">Loading...</div>';
            },
            notFound: (query) => {
                return '<div class="tt-suggestion">Not found...</div>';
            }
        }
    });

    c.bind('typeahead:select', (ev, item) => {
        const placeholder = $("#company-id");

        placeholder.html(item.name);
        placeholder.data('id', item.value);

        //$(ev.currentTarget.id).val('');
    });
});
/*

(function () {
    'use strict'

    // Graphs
    var ctx = document.getElementById('myChart')
    // eslint-disable-next-line no-unused-vars
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday'
            ],
            datasets: [{
                data: [
                    15339,
                    21345,
                    18483,
                    24003,
                    23489,
                    24092,
                    12034
                ],
                lineTension: 0,
                backgroundColor: 'transparent',
                borderColor: '#007bff',
                borderWidth: 4,
                pointBackgroundColor: '#007bff'
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false
                    }
                }]
            },
            legend: {
                display: false
            }
        }
    })
}())*/