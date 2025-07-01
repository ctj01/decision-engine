using credit_bureau_new.Models;
using MongoDB.Driver;

namespace credit_bureau_new.Services.ClientService
{
    public class ClientService : IClientService
    {
       private readonly IMongoCollection<Client> _clients;
        private readonly ILogger<ClientService> _logger;

        public ClientService(IConfiguration config, ILogger<ClientService> logger)
        {
            _logger = logger;
            var connectionString = config["MongoUri"]!;
            _logger.LogInformation("Connecting to MongoDB with URI: {MongoUri}", connectionString);

            var client = new MongoClient(connectionString);
            var database = client.GetDatabase("creditbureau");
            _clients = database.GetCollection<Client>("clients");
            _logger.LogInformation("MongoDB collection 'clients' initialized successfully.");
        }

        public async Task<IEnumerable<Client>> GetAllAsync()
        {
            _logger.LogDebug("Retrieving all clients from database.");
            return await _clients.Find(_ => true).ToListAsync();
        }

        public async Task<Client?> GetByIdNumberAsync(string idNumber)
        {
            _logger.LogDebug("Searching for client with ID number: {IdNumber}", idNumber);
            var client = await _clients.Find(c => c.IdNumber == idNumber).FirstOrDefaultAsync();
            if (client is null)
            {
                _logger.LogWarning("No client found with ID number: {IdNumber}", idNumber);
            }
            else
            {
                _logger.LogInformation("Client found: {ClientId}", client.Id);
            }
            return client;
        }

        public async Task CreateAsync(Client client)
        {
            _logger.LogInformation("Creating new client with ID number: {IdNumber}", client.IdNumber);
            await _clients.InsertOneAsync(client);
        }

        public async Task<bool> UpdateAsync(string id, Client client)
        {
            _logger.LogInformation("Updating client with internal ID: {Id}", id);
            var result = await _clients.ReplaceOneAsync(c => c.Id == id, client);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            _logger.LogInformation("Deleting client with internal ID: {Id}", id);
            var result = await _clients.DeleteOneAsync(c => c.Id == id);
            return result.DeletedCount > 0;
        }
    }
}