CREATE TABLE [dbo].[Payments] (
    [Id]          UNIQUEIDENTIFIER CONSTRAINT [DF_Payments_Id] DEFAULT (newsequentialid()) NOT NULL,
    [LoanId]      UNIQUEIDENTIFIER NOT NULL,
    [PaymentDate] DATETIME2 (7)    DEFAULT (sysutcdatetime()) NOT NULL,
    [Amount]      DECIMAL (18, 2)  NOT NULL,
    [PaymentType] NVARCHAR (50)    NOT NULL,
    CONSTRAINT [PK_Payments] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Payments_Loans] FOREIGN KEY ([LoanId]) REFERENCES [dbo].[Loans] ([Id])
);


GO
CREATE NONCLUSTERED INDEX [IX_Payments_PaymentDate]
    ON [dbo].[Payments]([PaymentDate] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Payments_LoanId]
    ON [dbo].[Payments]([LoanId] ASC);

