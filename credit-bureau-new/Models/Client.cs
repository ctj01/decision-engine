namespace credit_bureau_new.Models
{
    using MongoDB.Bson;
    using MongoDB.Bson.Serialization.Attributes;
    using System.Collections.Generic;

    public class PaymentRecord
    {
        [BsonElement("month")]
        public string Month { get; set; }

        [BsonElement("status")]
        public string Status { get; set; }
    }

    public class Client
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("id_number")]
        public string IdNumber { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("age")]
        public int Age { get; set; }

        [BsonElement("city")]
        public string City { get; set; }

        [BsonElement("salary")]
        public int Salary { get; set; }

        [BsonElement("employment_type")]
        public string EmploymentType { get; set; }

        [BsonElement("credit_score")]
        public int CreditScore { get; set; }

        [BsonElement("is_reported")]
        public bool IsReported { get; set; }

        [BsonElement("total_debt")]
        public int TotalDebt { get; set; }

        [BsonElement("payment_history")]
        public List<PaymentRecord> PaymentHistory { get; set; }
    }
}
