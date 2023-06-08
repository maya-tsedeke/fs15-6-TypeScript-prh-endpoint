"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var readline = require("readline");
// Create a readline interface for reading input from the console
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
// Prompt the user for input and start the program when input is received
rl.question('Enter totalResults: ', function (totalResults) {
    rl.question('Enter streetAddressPostCode: ', function (streetAddressPostCode) {
        rl.question('Enter resultsFrom: ', function (resultsFrom) {
            rl.question('Enter maxResults: ', function (maxResults) {
                // Construct the endpoint URL using the user input
                var endpoint = "http://avoindata.prh.fi/bis/v1?totalResults=".concat(totalResults, "&maxResults=").concat(maxResults, "&resultsFrom=").concat(resultsFrom, "&streetAddressPostCode=").concat(streetAddressPostCode);
                // Send a GET request to the endpoint URL using axios
                axios_1.default.get(endpoint)
                    .then(function (response) {
                    // Extract the list of companies from the response
                    var companies = response.data.results;
                    var companyStrings = [];
                    var companyPromises = [];
                    // Iterate over each company and create a promise for fetching its details
                    companies.forEach(function (company) {
                        var businessId = company.businessId;
                        // Send a GET request to the details endpoint for the current company
                        var promise = axios_1.default.get("http://avoindata.prh.fi/bis/v1/".concat(businessId))
                            .then(function (response) {
                            // Extract the company details from the response and format them into a string
                            var companyDetails = response.data;
                            var companyString = "Details URI: ".concat(company.detailsUri, "\n") +
                                "Details: ".concat(JSON.stringify(companyDetails, null, 2), "\n") +
                                '----------------------\n';
                            // Add the company details promise to an array for later use
                            companyPromises.push(promise);
                            console.log(companyString);
                            return companyString;
                        })
                            .catch(function (error) {
                            var _a;
                            // Handle errors that occur while fetching company details
                            if (axios_1.default.isAxiosError(error)) {
                                console.error("Error fetching details for Business ID: ".concat(businessId));
                                console.error((_a = error.response) === null || _a === void 0 ? void 0 : _a.data);
                                return "Error fetching details for Business ID: ".concat(businessId);
                            }
                            else {
                                console.error("Error fetching details for Business ID: ".concat(businessId), error);
                                return "Error fetching details for Business ID: ".concat(businessId);
                            }
                        });
                    });
                    // Wait for all company details promises to resolve and then join the strings together for output
                    Promise.all(companyPromises)
                        .then(function (companyStrings) {
                        console.log(companyStrings.join(''));
                    })
                        .catch(function (error) {
                        console.error('Error while fetching company details:');
                        console.error(error);
                    })
                        .finally(function () { return rl.close(); });
                })
                    .catch(function (error) {
                    // Handle errors that occur while fetching the list of companies
                    console.error('Error while fetching company list:');
                    console.error(error);
                    rl.close();
                });
            });
        });
    });
});
