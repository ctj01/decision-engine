CREATE TABLE [dbo].[LoanRequests] (
    [Id]          UNIQUEIDENTIFIER CONSTRAINT [DF_LoanRequests_Id] DEFAULT (newsequentialid()) NOT NULL,
    [CustomerId]  UNIQUEIDENTIFIER NOT NULL,
    [ProductId]   UNIQUEIDENTIFIER NOT NULL,
    [Amount]      DECIMAL (18, 2)  NOT NULL,
    [TermMonths]  INT              NOT NULL,
    [Status]      NVARCHAR (20)    DEFAULT ('Pending') NOT NULL,
    [RequestDate] DATETIME2 (7)    DEFAULT (sysutcdatetime()) NOT NULL,
    CONSTRAINT [PK_LoanRequests] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_LoanRequests_Customers] FOREIGN KEY ([CustomerId]) REFERENCES [dbo].[Customers] ([Id]),
    CONSTRAINT [FK_LoanRequests_LoanProducts] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[LoanProducts] ([Id])
);


GO
CREATE NONCLUSTERED INDEX [IX_LoanRequests_Status]
    ON [dbo].[LoanRequests]([Status] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_LoanRequests_CustomerId]
    ON [dbo].[LoanRequests]([CustomerId] ASC);

