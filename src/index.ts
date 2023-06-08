import axios, { AxiosError } from 'axios';
import * as readline from 'readline';

// Create a readline interface for reading input from the console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
// Prompt the user for input and start the program when input is received
rl.question('Enter totalResults: ', (totalResults) => {
  rl.question('Enter streetAddressPostCode: ', (streetAddressPostCode) => {
    rl.question('Enter resultsFrom: ', (resultsFrom) => {
      rl.question('Enter maxResults: ', (maxResults) => {
        // Construct the endpoint URL using the user input
        const endpoint = `http://avoindata.prh.fi/bis/v1?totalResults=${totalResults}&maxResults=${maxResults}&resultsFrom=${resultsFrom}&streetAddressPostCode=${streetAddressPostCode}`;

        // Send a GET request to the endpoint URL using axios
        axios.get(endpoint)
          .then(response => {
            // Extract the list of companies from the response
            const companies = response.data.results;
            const companyStrings: string[] = [];
            const companyPromises: Promise<string>[] = [];
            // Iterate over each company and create a promise for fetching its details
            companies.forEach((company: { businessId: any; detailsUri: any; }) => {
              const businessId = company.businessId;
              // Send a GET request to the details endpoint for the current company
              const promise = axios.get(`http://avoindata.prh.fi/bis/v1/${businessId}`)
                .then((response) => {
                  // Extract the company details from the response and format them into a string
                  const companyDetails = response.data;
                  const companyString =
                    `Details URI: ${company.detailsUri}\n` +
                    `Details: ${JSON.stringify(companyDetails, null, 2)}\n` +
                    '----------------------\n';
                  // Add the company details promise to an array for later use
                  companyPromises.push(promise);
                  console.log(companyString);
                  return companyString;
                })
                .catch((error: AxiosError) => {
                  // Handle errors that occur while fetching company details
                  if (axios.isAxiosError(error)) {
                    console.error(`Error fetching details for Business ID: ${businessId}`);
                    console.error(error.response?.data);
                    return `Error fetching details for Business ID: ${businessId}`;
                  } else {
                    console.error(`Error fetching details for Business ID: ${businessId}`, error);
                    return `Error fetching details for Business ID: ${businessId}`;
                  }
                });
            });
            // Wait for all company details promises to resolve and then join the strings together for output
            Promise.all(companyPromises)
              .then(companyStrings => {
                console.log(companyStrings.join(''));
              })
              .catch(error => {
                console.error('Error while fetching company details:');
                console.error(error);
              })
              .finally(() => rl.close());
          })
          .catch(error => {
            // Handle errors that occur while fetching the list of companies
            console.error('Error while fetching company list:');
            console.error(error);
            rl.close();
          });
      });
    });
  });
});
