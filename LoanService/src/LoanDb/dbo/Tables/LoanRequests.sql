CREATE TABLE [dbo].[LoanRequests] (
    [Id]              UNIQUEIDENTIFIER CONSTRAINT [DF_LoanRequests_Id] DEFAULT (newsequentialid()) NOT NULL,
    [CustomerId]      UNIQUEIDENTIFIER NOT NULL,
    [ProductId]       UNIQUEIDENTIFIER NOT NULL,
    [Amount]          DECIMAL (18, 2)  NOT NULL,
    [TermMonths]      INT              NOT NULL,
    [Status]          NVARCHAR (20)    DEFAULT ('Pending') NOT NULL,
    [RequestDate]     DATETIME2 (7)    DEFAULT (sysutcdatetime()) NOT NULL,
    [Purpose]         NVARCHAR (500)   NOT NULL DEFAULT (''),
    [Notes]           NVARCHAR(MAX)    NULL,
    [AiDecision]      NVARCHAR (50)    NULL,
    [AiConfidence]    REAL             NULL,
    [AiReasons]       NVARCHAR(MAX)    NULL,
    [AiEvaluationDate] DATETIME2 (7)   NULL,
    [Salary]          DECIMAL (18, 2)  NOT NULL DEFAULT (0),
    [Age]             INT              NOT NULL DEFAULT (0),
    [CreditScore]     INT              NOT NULL DEFAULT (0),
    [TotalDebt]       DECIMAL (18, 2)  NOT NULL DEFAULT (0),
    [EmploymentType]  NVARCHAR (50)    NOT NULL DEFAULT ('employed'),
    [IsReported]      BIT              NOT NULL DEFAULT (0),
    [PaymentHistoryJson] NVARCHAR(MAX) NULL,
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

