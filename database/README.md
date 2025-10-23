# Database Configuration

This directory contains database-related files and configurations for the SolveGuild platform.

## MongoDB Setup

### Local Development
1. Install MongoDB locally
2. Start MongoDB service
3. Create database: `use solveguild`

### Production
- Use MongoDB Atlas or other cloud providers
- Configure connection string in environment variables

## Database Schema

### Collections
- `users` - User accounts and profiles
- `issues` - Client posted issues
- `doubts` - Technical doubt posts
- `chats` - Chat conversations
- `messages` - Chat messages
- `notifications` - User notifications
- `groups` - Community groups

### Indexes
- User email and username (unique)
- Issue category and status
- Doubt category and difficulty
- Chat participants
- Message timestamps

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/solveguild
```

## Backup and Migration

### Backup
```bash
mongodump --db solveguild --out ./backup
```

### Restore
```bash
mongorestore --db solveguild ./backup/solveguild
```

## Performance Optimization

1. **Indexing Strategy**
   - Compound indexes for common queries
   - Text indexes for search functionality
   - Sparse indexes for optional fields

2. **Query Optimization**
   - Use projection to limit returned fields
   - Implement pagination for large datasets
   - Use aggregation pipelines for complex queries

3. **Connection Pooling**
   - Configure appropriate pool size
   - Monitor connection usage
   - Implement connection retry logic
