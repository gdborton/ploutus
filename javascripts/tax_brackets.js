define([], function() {
    return [
        {
            value: "singleFiler",
            display: "Single",
            brackets: [
                { "rate": 0.1, "min": 0, "max": 8925 },
                { "rate": 0.15, "min": 8925, "max": 36250 },
                { "rate": 0.25, "min": 36250, "max": 87850 },
                { "rate": 0.28, "min": 87850, "max": 183250 },
                { "rate": 0.33, "min": 183250, "max": 398350 },
                { "rate": 0.35, "min": 398350, "max": 400000 },
                { "rate": 0.39, "min": 400000, "max": null }
            ]
        },
        {
            value: "jointFiler",
            display: "Married Joint",
            brackets: [
                { "rate": 0.1, "min": 0, "max": 17850 },
                { "rate": 0.15, "min": 17850, "max": 72500 },
                { "rate": 0.25, "min": 72500, "max": 146400 },
                { "rate": 0.28, "min": 146400, "max": 223050 },
                { "rate": 0.33, "min": 223050, "max": 398350 },
                { "rate": 0.35, "min": 398350, "max": 450000 },
                { "rate": 0.39, "min": 450000, "max": null }
            ]
        },
        {
            value: "headOfHousehold",
            display: "Head of Household",
            brackets: [
                { "rate": 0.1, "min": 0, "max": 12750 },
                { "rate": 0.15, "min": 12750, "max": 48600 },
                { "rate": 0.25, "min": 48600, "max": 125450 },
                { "rate": 0.28, "min": 125450, "max": 203150 },
                { "rate": 0.33, "min": 203150, "max": 398350 },
                { "rate": 0.35, "min": 398350, "max": 425000 },
                { "rate": 0.39, "min": 425000, "max": null }
            ]
        }
    ];
});