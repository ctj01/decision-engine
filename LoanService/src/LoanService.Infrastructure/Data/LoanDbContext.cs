using Microsoft.EntityFrameworkCore;
using LoanService.Core;

namespace LoanService.Infrastructure.Data
{
    public class LoanDbContext : DbContext
    {
        public LoanDbContext(DbContextOptions<LoanDbContext> options)
            : base(options)
        {
        }

        public DbSet<Customer> Customers { get; set; } = null!;
        public DbSet<LoanProduct> LoanProducts { get; set; } = null!;
        public DbSet<LoanRequest> LoanRequests { get; set; } = null!;
        public DbSet<Loan> Loans { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

         
            modelBuilder.Entity<Customer>(b =>
            {
                b.HasKey(x => x.Id);
                b.Property(x => x.FullName)
                 .IsRequired()
                 .HasMaxLength(200);
                b.Property(x => x.Email)
                 .IsRequired()
                 .HasMaxLength(100);
                b.Property(x => x.IdentificationNumber)
                 .IsRequired()
                 .HasMaxLength(50);
            });

          
            modelBuilder.Entity<LoanProduct>(b =>
            {
                b.HasKey(x => x.Id);
                b.Property(x => x.Name)
                 .IsRequired()
                 .HasMaxLength(100);
                b.Property(x => x.AnnualInterestRate)
                 .HasColumnType("decimal(5,2)");
                b.Property(x => x.MinAmount)
                 .HasColumnType("decimal(18,2)");
                b.Property(x => x.MaxAmount)
                 .HasColumnType("decimal(18,2)");
            });

            
            modelBuilder.Entity<LoanRequest>(b =>
            {
                b.HasKey(x => x.Id);
                b.Property(x => x.Amount)
                 .HasColumnType("decimal(18,2)");
                b.Property(x => x.TermMonths)
                 .IsRequired();
                b.Property(x => x.RequestDate)
                 .IsRequired();
                b.HasOne(x => x.Customer)
                 .WithMany()
                 .HasForeignKey(x => x.CustomerId);
            });

            
            modelBuilder.Entity<Loan>(b =>
            {
                b.HasKey(x => x.Id);
                b.Property(x => x.Principal)
                 .HasColumnType("decimal(18,2)");
                b.Property(x => x.InterestRate)
                 .HasColumnType("decimal(5,2)");
                b.Property(x => x.TermMonths)
                 .IsRequired();
                b.Property(x => x.StartDate)
                 .IsRequired();
                b.Property(x => x.Status)
                 .IsRequired()
                 .HasMaxLength(50);

                b.HasOne(x => x.Customer)
                 .WithMany()
                 .HasForeignKey(x => x.CustomerId);

                
                b.HasOne(x => x.LoanRequest)
                 .WithOne()
                .HasForeignKey<Loan>(x => x.LoanRequestId);
            });

            // Payment
            modelBuilder.Entity<Payment>(b =>
            {
                b.HasKey(x => x.Id);
                b.Property(x => x.Amount)
                 .HasColumnType("decimal(18,2)");
                b.Property(x => x.DueDate)
                 .IsRequired();
                b.HasOne(x => x.Loan)
                 .WithMany()
                 .HasForeignKey(x => x.LoanId);
            });
        }
    }
}
