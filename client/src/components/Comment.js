import { format } from 'date-fns';

export default function Comment({ comment }) {
  return (
    <div className="border-b pb-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium">{comment.author}</span>
        <span className="text-sm text-gray-500">
          {format(new Date(comment.createdAt.seconds * 1000), 'MMM d, yyyy')}
        </span>
      </div>
      <p className="text-gray-700">{comment.content}</p>
    </div>
  );
}