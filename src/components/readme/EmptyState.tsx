export default function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-icon">M↓</div>

      <h3>No README loaded yet</h3>

      <p>
        Enter a repository URL above to see its documentation here.
      </p>

      <div className="example-url">
        github.com/facebook/react
      </div>
    </div>
  );
}