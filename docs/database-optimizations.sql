-- Loan Service Database Optimizations

-- 1. Add indexes for better query performance
CREATE INDEX IX_Loans_CustomerId_Status ON Loans (CustomerId, Status);
CREATE INDEX IX_LoanRequests_RequestDate ON LoanRequests (RequestDate);
CREATE INDEX IX_LoanRequests_Status_Amount ON LoanRequests (Status, Amount);

-- 2. Add partitioning for large tables (SQL Server)
ALTER PARTITION SCHEME LoanRequestsPartitionScheme NEXT USED [PRIMARY];
ALTER PARTITION FUNCTION LoanRequestsPartitionFunction() SPLIT RANGE ('2024-01-01');

-- 3. Create materialized view for analytics
CREATE VIEW vw_LoanAnalytics
WITH SCHEMABINDING
AS
SELECT 
    YEAR(RequestDate) as Year,
    MONTH(RequestDate) as Month,
    Status,
    COUNT_BIG(*) as RequestCount,
    AVG(Amount) as AvgAmount,
    SUM(Amount) as TotalAmount
FROM dbo.LoanRequests
GROUP BY YEAR(RequestDate), MONTH(RequestDate), Status;

CREATE UNIQUE CLUSTERED INDEX IX_LoanAnalytics 
ON vw_LoanAnalytics (Year, Month, Status);

-- 4. Add audit trail table
CREATE TABLE LoanAuditTrail (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    LoanId UNIQUEIDENTIFIER NOT NULL,
    Action NVARCHAR(50) NOT NULL,
    OldValues NVARCHAR(MAX),
    NewValues NVARCHAR(MAX),
    UserId NVARCHAR(450),
    Timestamp DATETIME2 DEFAULT GETUTCDATE(),
    INDEX IX_LoanAuditTrail_LoanId (LoanId),
    INDEX IX_LoanAuditTrail_Timestamp (Timestamp)
);

-- 5. Performance monitoring queries
-- Query to find slow operations
SELECT 
    qs.execution_count,
    qs.total_elapsed_time / 1000 as total_elapsed_time_ms,
    qs.avg_elapsed_time / 1000 as avg_elapsed_time_ms,
    qt.text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
WHERE qt.text LIKE '%Loan%'
ORDER BY qs.avg_elapsed_time DESC;
