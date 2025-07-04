CREATE TABLE [dbo].[Customers] (
    [Id]                   UNIQUEIDENTIFIER CONSTRAINT [DF_Customers_Id] DEFAULT (newsequentialid()) NOT NULL,
    [FullName]             NVARCHAR (200)   NOT NULL,
    [Email]                NVARCHAR (150)   NOT NULL,
    [IdentificationNumber] NVARCHAR (50)    NOT NULL,
    [CreatedAt]            DATETIME2 (7)    DEFAULT (sysutcdatetime()) NOT NULL,
    CONSTRAINT [PK_Customers] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IX_Customers_Email]
    ON [dbo].[Customers]([Email] ASC);

