CREATE TABLE [dbo].[LoanProducts] (
    [Id]           UNIQUEIDENTIFIER CONSTRAINT [DF_LoanProducts_Id] DEFAULT (newsequentialid()) NOT NULL,
    [Name]         NVARCHAR (100)   NOT NULL,
    [Description]  NVARCHAR (500)   NULL,
    [InterestRate] DECIMAL (5, 2)   NOT NULL,
    [CreatedAt]    DATETIME2 (7)    DEFAULT (sysutcdatetime()) NOT NULL,
    CONSTRAINT [PK_LoanProducts] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IX_LoanProducts_Name]
    ON [dbo].[LoanProducts]([Name] ASC);

