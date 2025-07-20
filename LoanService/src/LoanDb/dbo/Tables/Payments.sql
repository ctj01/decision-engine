CREATE TABLE [dbo].[Payments] (
    [Id]          UNIQUEIDENTIFIER CONSTRAINT [DF_Payments_Id] DEFAULT (newsequentialid()) NOT NULL,
    [LoanId]      UNIQUEIDENTIFIER NOT NULL,
    [DueDate]     DATETIME2 (7)    NOT NULL,
    [Amount]      DECIMAL (18, 2)  NOT NULL,
    [PaidDate]    DATETIME2 (7)    NULL,
    [PaidAmount]  DECIMAL (18, 2)  NULL,
    CONSTRAINT [PK_Payments] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Payments_Loans] FOREIGN KEY ([LoanId]) REFERENCES [dbo].[Loans] ([Id])
);


GO
CREATE NONCLUSTERED INDEX [IX_Payments_DueDate]
    ON [dbo].[Payments]([DueDate] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Payments_LoanId]
    ON [dbo].[Payments]([LoanId] ASC);

