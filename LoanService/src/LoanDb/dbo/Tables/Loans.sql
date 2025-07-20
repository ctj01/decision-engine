CREATE TABLE [dbo].[Loans] (
    [Id]              UNIQUEIDENTIFIER CONSTRAINT [DF_Loans_Id] DEFAULT (newsequentialid()) NOT NULL,
    [LoanRequestId]   UNIQUEIDENTIFIER NOT NULL,
    [Principal]       DECIMAL (18, 2)  NOT NULL,
    [InterestRate]    DECIMAL (5, 2)   NOT NULL,
    [TermMonths]      INT              NOT NULL,
    [StartDate]       DATETIME2 (7)    DEFAULT (sysutcdatetime()) NOT NULL,
    [CustomerId]      UNIQUEIDENTIFIER NOT NULL,
    [Status]          NVARCHAR (50)    DEFAULT ('Active') NOT NULL,
    CONSTRAINT [PK_Loans] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Loans_LoanRequests] FOREIGN KEY ([LoanRequestId]) REFERENCES [dbo].[LoanRequests] ([Id]),
    CONSTRAINT [FK_Loans_Customers] FOREIGN KEY ([CustomerId]) REFERENCES [dbo].[Customers] ([Id])
);


GO
CREATE NONCLUSTERED INDEX [IX_Loans_Status]
    ON [dbo].[Loans]([Status] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Loans_LoanRequestId]
    ON [dbo].[Loans]([LoanRequestId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Loans_CustomerId]
    ON [dbo].[Loans]([CustomerId] ASC);

