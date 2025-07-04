CREATE TABLE [dbo].[Loans] (
    [Id]              UNIQUEIDENTIFIER CONSTRAINT [DF_Loans_Id] DEFAULT (newsequentialid()) NOT NULL,
    [LoanRequestId]   UNIQUEIDENTIFIER NOT NULL,
    [DisbursedAmount] DECIMAL (18, 2)  NOT NULL,
    [DisbursedDate]   DATETIME2 (7)    DEFAULT (sysutcdatetime()) NOT NULL,
    [MaturityDate]    DATETIME2 (7)    NOT NULL,
    [Status]          NVARCHAR (20)    DEFAULT ('Active') NOT NULL,
    CONSTRAINT [PK_Loans] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Loans_LoanRequests] FOREIGN KEY ([LoanRequestId]) REFERENCES [dbo].[LoanRequests] ([Id])
);


GO
CREATE NONCLUSTERED INDEX [IX_Loans_Status]
    ON [dbo].[Loans]([Status] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Loans_LoanRequestId]
    ON [dbo].[Loans]([LoanRequestId] ASC);

