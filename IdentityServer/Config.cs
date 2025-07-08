namespace IdentityServer
{
    using Duende.IdentityServer.Models;
    using System.Collections.Generic;

    public static class Config
    {
        public static IEnumerable<IdentityResource> IdentityResources =>
        [
            new IdentityResources.OpenId(),
                new IdentityResources.Profile()
        ];
        public static IEnumerable<ApiResource> ApiResources =>
            new[]
            {
                new ApiResource("loanApi")
                {
                    Scopes = { "loan.request" }
                },
                new ApiResource("creditApi")
                {
                    Scopes = { "credit.read" }
                }
            };

        public static IEnumerable<ApiScope> ApiScopes =>
            new[]
            {
                new ApiScope("credit.read",  "Read access to Credit API"),
                new ApiScope("loan.request", "Request loans")
            };

        public static IEnumerable<Client> Clients =>
            new[]
            {
                // Credit Bureau → Credit API
                new Client
                {
                    ClientId           = "credit-bureau-client",
                    ClientName         = "Credit Bureau Service",
                    ClientSecrets      = { new Secret("credit-bureau-secret".Sha256()) },
                    AllowedGrantTypes  = GrantTypes.ClientCredentials,
                    AllowedScopes      = { "credit.read" }
                },

                // Loan Service → Loan API
                new Client
                {
                    ClientId           = "loan-service-client",
                    ClientName         = "Loan Service",
                    ClientSecrets      = { new Secret("loan-service-secret".Sha256()) },
                    AllowedGrantTypes  = GrantTypes.ClientCredentials,
                    AllowedScopes      = { "loan.request" }
                },

                // SPA for end-user login
                new Client
                {
                    ClientId                     = "loan-frontend-spa",
                    ClientName                   = "LoanApp SPA",
                    RequireClientSecret          = false,
                    RequirePkce                  = true,
                    AllowedGrantTypes            = GrantTypes.Code,
                    RedirectUris                 = { "http://localhost:5173/callback" },
                    PostLogoutRedirectUris       = { "http://localhost:5173/" },
                    AllowedCorsOrigins           = { "http://localhost:5173" },
                    AllowedScopes                = { "openid", "profile", "loan.request" },
                    AllowAccessTokensViaBrowser  = true
                },

                // (Optional) ROPC client
                new Client
                {
                    ClientId                = "loan-ropc-client",
                    ClientName              = "LoanApp ROPC Client",
                    RequireClientSecret     = false,
                    AllowedGrantTypes       = GrantTypes.ResourceOwnerPassword,
                    AllowedScopes           = { "openid", "profile", "loan.request" },
                    AllowOfflineAccess      = true
                }
            };
    }
}
