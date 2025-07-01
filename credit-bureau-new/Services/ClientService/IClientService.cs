using credit_bureau_new.Models;

namespace credit_bureau_new.Services.ClientService
{
    public interface IClientService
    {
        Task<Client?> GetByIdNumberAsync(string idNumber);
        Task<IEnumerable<Client>> GetAllAsync();
        Task CreateAsync(Client client);
        Task<bool> UpdateAsync(string id, Client client);
        Task<bool> DeleteAsync(string id);
    }
}
