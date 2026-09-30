CREATE UNIQUE INDEX "Framework_global_name_unique" ON "Framework"("name") WHERE "ownership"='GLOBAL';
INSERT INTO "Framework"("id","organizationId","name","publisher","description","ownership") VALUES
('10000000-0000-4000-8000-000000000001',NULL,'ISO/IEC 27001','ISO/IEC','Information security management systems — catalog metadata only; licensed requirement content is not bundled.','GLOBAL'),
('10000000-0000-4000-8000-000000000002',NULL,'PCI DSS','PCI Security Standards Council','Payment Card Industry Data Security Standard — catalog metadata only.','GLOBAL'),
('10000000-0000-4000-8000-000000000003',NULL,'SOC 2 Trust Services Criteria','AICPA','Trust Services Criteria — catalog metadata only.','GLOBAL'),
('10000000-0000-4000-8000-000000000004',NULL,'NIST Cybersecurity Framework','NIST','Cybersecurity Framework catalog metadata.','GLOBAL'),
('10000000-0000-4000-8000-000000000005',NULL,'CIS Controls','Center for Internet Security','CIS Critical Security Controls — catalog metadata only.','GLOBAL'),
('10000000-0000-4000-8000-000000000006',NULL,'GDPR','European Union','General Data Protection Regulation catalog metadata.','GLOBAL'),
('10000000-0000-4000-8000-000000000007',NULL,'HIPAA','U.S. Department of Health and Human Services','HIPAA Security and Privacy Rules catalog metadata.','GLOBAL'),
('10000000-0000-4000-8000-000000000008',NULL,'NIST SP 800-53','NIST','Security and Privacy Controls catalog metadata.','GLOBAL'),
('10000000-0000-4000-8000-000000000009',NULL,'Nigeria Data Protection Act','Nigeria Data Protection Commission','Nigeria Data Protection Act catalog metadata.','GLOBAL'),
('10000000-0000-4000-8000-000000000010',NULL,'COBIT','ISACA','Governance and management objectives catalog metadata.','GLOBAL'),
('10000000-0000-4000-8000-000000000011',NULL,'ISO 22301','ISO','Business continuity management systems — catalog metadata only.','GLOBAL'),
('10000000-0000-4000-8000-000000000012',NULL,'ISO/IEC 27701','ISO/IEC','Privacy information management — catalog metadata only; licensed requirement content is not bundled.','GLOBAL')
ON CONFLICT DO NOTHING;
