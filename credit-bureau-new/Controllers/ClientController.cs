using credit_bureau_new.Models;
using credit_bureau_new.Services.ClientService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace credit_bureau_new.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientsController : ControllerBase
    {
        private readonly IClientService _clientService;
        private readonly ILogger<ClientsController> _logger;

        public ClientsController(IClientService clientService, ILogger<ClientsController> logger)
        {
            _clientService = clientService;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Policy = "CreditReadScope")]
        public async Task<IActionResult> GetAllClients()
        {
            _logger.LogInformation("Retrieving all clients.");
            var clients = await _clientService.GetAllAsync();
            return Ok(clients);
        }

        [HttpGet("{idNumber}")]
        [Authorize(Policy = "CreditReadScope")]
        public async Task<IActionResult> GetClientById(string idNumber)
        {
            _logger.LogInformation("Retrieving client with ID number: {IdNumber}", idNumber);
            var client = await _clientService.GetByIdNumberAsync(idNumber);
            if (client == null)
            {
                _logger.LogWarning("Client not found with ID number: {IdNumber}", idNumber);
                return NotFound();
            }
            return Ok(client);
        }

        [HttpPost]
        [Authorize(Policy = "CreditReadScope")]
        public async Task<IActionResult> CreateClient([FromBody] Client client)
        {
            _logger.LogInformation("Creating client with ID number: {IdNumber}", client.IdNumber);
            await _clientService.CreateAsync(client);
            return CreatedAtAction(nameof(GetClientById), new { idNumber = client.IdNumber }, client);
        }

        [HttpPut("{idNumber}")]
        [Authorize(Policy = "CreditReadScope")]
        public async Task<IActionResult> UpdateClient(string idNumber, [FromBody] Client updatedClient)
        {
            _logger.LogInformation("Updating client with ID number: {IdNumber}", idNumber);
            var existingClient = await _clientService.GetByIdNumberAsync(idNumber);
            if (existingClient == null)
            {
                _logger.LogWarning("Client not found for update with ID number: {IdNumber}", idNumber);
                return NotFound();
            }
            updatedClient.Id = existingClient.Id;
            var result = await _clientService.UpdateAsync(existingClient.Id, updatedClient);
            if (!result)
            {
                _logger.LogError("Failed to update client with ID number: {IdNumber}", idNumber);
                return StatusCode(500, "Failed to update client.");
            }
            return NoContent();
        }

        [HttpDelete("{idNumber}")]
        [Authorize(Policy = "CreditReadScope")]
        public async Task<IActionResult> DeleteClient(string idNumber)
        {
            _logger.LogInformation("Deleting client with ID number: {IdNumber}", idNumber);
            var existingClient = await _clientService.GetByIdNumberAsync(idNumber);
            if (existingClient == null)
            {
                _logger.LogWarning("Client not found for deletion with ID number: {IdNumber}", idNumber);
                return NotFound();
            }
            var result = await _clientService.DeleteAsync(existingClient.Id);
            if (!result)
            {
                _logger.LogError("Failed to delete client with ID number: {IdNumber}", idNumber);
                return StatusCode(500, "Failed to delete client.");
            }
            return NoContent();
        }
    }
}

