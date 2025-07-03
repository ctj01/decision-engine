namespace LoanService.Core;

public class LoanProduct
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal AnnualInterestRate { get; set; }
    public int MaxTermMonths { get; set; }
    public decimal MinAmount { get; set; }
    public decimal MaxAmount { get; set; }
}