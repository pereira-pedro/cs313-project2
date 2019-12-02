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

    $("#chart-options > .dropdown-item").click(function () {
        $.getJSON(url + '/stock', {
            symbol: $('#company-id').data('id'),
            interval: '5min',
            method: $(this).data('method')
        },
        )
            .done((result) => {
                drawChart(result);
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


function drawChart(data) {
    console.log(JSON.stringify(data.series))
    const options = {
        chart: {
            height: 450,
            type: 'candlestick',
        },
        candlestick: {
            colors: {
                upward: '#4caf50',
                downward: '#f44336'
            }
        },
        series: data.series,
        title: {
            text: data.metadata.information,
            align: 'left'
        },
        xaxis: {
            type: 'datetime'
        },
        yaxis: {
            tooltip: {
                enabled: true
            }
        }
    }

    var chart = new ApexCharts(
        document.querySelector("#chart"),
        options
    );

    chart.render();
}
