const url = window.location.hostname.startsWith("localhost")
    ? "http://localhost:3000"
    : "https://enigmatic-headland-55249.herokuapp.com";

$(document).ready(() => {
    const userId = localStorage.getItem("user_id");

    if (typeof userId !== "undefined" && userId !== null) {
        $.get(url + '/retrieve', {
            id: userId
        },
        )
            .done((result) => {
                if (typeof result !== "undefined") {
                    $("#user-email").val(result.email);
                    createCompanyList(result.stocks);
                }
            })
            .fail((result) => {
                console.log(JSON.stringify(result));
            });
    }

    $("#user-email").change(() => {
        const email = $("#user-email").val()
        $.get(url + '/retrieve', {
            email: email
        },
        )
            .done((result) => {
                if (typeof result !== "undefined") {
                    $("#user-email").val(result.email);
                    localStorage.setItem("user_id", result.id);
                    createCompanyList(result.stocks);
                }
            })
            .fail((result) => {
                Swal.fire({
                    title: 'Error',
                    text: result.responseText,
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            });

    });
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
        selectCompany(item.value, item.name);
    });

    $("#btn-save-email").click(() => {
        const c = $("#company-id");
        const email = $("#user-email").val();

        if (email === '') {
            Swal.fire({
                title: 'Error',
                text: "You need to inform your email.",
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return;
        }

        $.post(url + '/save', {
            stock_name: c.text(),
            stock_symbol: c.data('id'),
            email: email
        },
        )
            .done((result) => {
                localStorage.setItem("user_id",
                    result.id);
                createCompanyList(result.stocks);
            })
            .fail((result) => {
                Swal.fire({
                    title: 'Error',
                    text: result.responseText,
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            });
    });
});

function createCompanyList(stocks) {

    if (stocks.length <= 0) {
        return;

    }
    const list = $('#company-list');
    list.empty();
    stocks.forEach((row, idx) => {
        createCompanyObject(list, row.symbol, row.name);
    });

}
function createCompanyObject(container, symbol, name) {

    $('<li />', {
        'class': 'nav-item',
    })
        .append($('<a />', {
            'class': 'nav-link company',
            'href': '#',
            'data-symbol': symbol,
            'data-name': name,
            'text': name
        }).click(function () {
            selectCompany($(this).data('symbol'), $(this).data('name'));
        })
        )

        .appendTo(container);

}


function selectCompany(symbol, name) {
    const placeholder = $("#company-id");

    placeholder.html(name);
    placeholder.data('id', symbol);

    $("#ope-selector").removeClass("invisible").addClass("visible");
}
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