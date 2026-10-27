/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';

import { TodoList } from './components/TodoList';
import { FilterType, TodoFilter } from './components/TodoFilter';
import { TodoModal } from './components/TodoModal';
import { Loader } from './components/Loader';
import { Todo } from './types/Todo';
import { getPosts } from './servises/todos';
import { getUsers } from './servises/users';
import { User } from './types/User';
import { wait } from './utils/httpClient';

export const App: React.FC = () => {
  const [todosFromServer, setTodosFromServer] = useState<Todo[]>([]);
  const [users, setUsers] = useState<User[]>();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [query, setQuery] = useState('');
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    wait(1000);
    getUsers().then(setUsers);
    getPosts()
      .then(setTodosFromServer)
      .then(() => {
        setLoading(false);
      });
  }, []);

  const fullDataPost = todosFromServer.map(post => {
    const foundedUser = users?.find(user => user.id === post.userId);

    return {
      ...post,
      user: foundedUser || null,
    };
  });

  const visibleTodos = fullDataPost.filter(todo => {
    const matchesStatus =
      selectedFilter === 'all' ||
      (selectedFilter === 'active' && !todo.completed) ||
      (selectedFilter === 'completed' && todo.completed);

    const normalizedQuery = query.toLowerCase().trim();
    const matchesQuery = todo.title.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });

  return (
    <>
      <div className="section">
        <div className="container">
          <div className="box">
            <h1 className="title">Todos:</h1>

            <div className="block">
              <TodoFilter
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
                query={query}
                setQuery={setQuery}
              />
            </div>

            <div className="block">
              {loading && <Loader />}
              <TodoList
                todos={visibleTodos}
                selectedTodo={selectedTodo}
                onSelectedTodo={setSelectedTodo}
              />
            </div>
          </div>
        </div>
      </div>
      {selectedTodo && (
        <TodoModal enterTodo={selectedTodo} onSelectedTodo={setSelectedTodo} />
      )}
    </>
  );
};
