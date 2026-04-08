<style scoped>
.database-router {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-primary);
  border-left: 1px solid var(--border-secondary);
}

.no-connection,
.unsupported {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-hint);
  font-size: 12px;
}
</style>