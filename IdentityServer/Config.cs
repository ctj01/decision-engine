namespace IdentityServer
{
    using Duende.IdentityServer.Models;
    using System.Collections.Generic;

    public static class Config
    {
        // Expose OpenID Connect identity data (only if you have user-centric flows)
        public static IEnumerable<IdentityResource> IdentityResources =>
            new IdentityResource[]
            {
                new IdentityResources.OpenId(),
                new IdentityResources.Profile(),
            };

        // Define the API scopes your microservices will accept
        public static IEnumerable<ApiScope> ApiScopes =>
            new ApiScope[]
            {
                new ApiScope("credit.read",  "Read access to Credit API"),
                new ApiScope("loan.request", "Request loans")
            };

        // Configure clients
        public static IEnumerable<Client> Clients =>
            new Client[]
            {
                // Credit Bureau → Credit API
                new Client
                {
                    ClientId     = "credit-bureau-client",
                    ClientName   = "Credit Bureau Service",
                    ClientSecrets= { new Secret("credit-bureau-secret".Sha256()) },

                    AllowedGrantTypes = GrantTypes.ClientCredentials,
                    AllowedScopes     = { "credit.read" }
                },

                // Loan Service → Loan API
                new Client
                {
                    ClientId      = "loan-service-client",
                    ClientName    = "Loan Service",
                    ClientSecrets = { new Secret("loan-service-secret".Sha256()) },

                    // Back-end → back-end communication
                    AllowedGrantTypes = GrantTypes.ClientCredentials,
                    AllowedScopes     = { "loan.request" }
                }
            };
    }
}