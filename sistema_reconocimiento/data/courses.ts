import { Course } from '../types';

export const courses: Course[] = [
  {
    id: 'javascript',
    title: 'JavaScript Fundamentals',
    description: 'Aprende los conceptos básicos de JavaScript desde cero',
    color: 'from-yellow-400 to-orange-500',
    icon: '💻',
    levels: [
      {
        id: 'js-1',
        title: 'Variables y Tipos de Datos',
        description: 'Aprende a declarar variables y trabajar con diferentes tipos de datos',
        difficulty: 'easy',
        estimatedTime: 15,
        content: [
          {
            type: 'text',
            content: 'Las variables son contenedores que almacenan datos. En JavaScript puedes usar let, const y var.'
          },
          {
            type: 'quiz',
            content: '¿Cuál es la forma moderna de declarar una variable?',
            options: ['var', 'let', 'variable', 'declare'],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 'js-2',
        title: 'Funciones',
        description: 'Domina las funciones en JavaScript',
        difficulty: 'medium',
        estimatedTime: 20,
        content: [
          {
            type: 'text',
            content: 'Las funciones son bloques de código reutilizables que realizan tareas específicas.'
          },
          {
            type: 'quiz',
            content: '¿Cómo se declara una función?',
            options: ['function name() {}', 'func name() {}', 'def name() {}', 'method name() {}'],
            correctAnswer: 0
          }
        ]
      },
      {
        id: 'js-3',
        title: 'Arrays y Objetos',
        description: 'Manipula estructuras de datos complejas',
        difficulty: 'medium',
        estimatedTime: 25,
        content: [
          {
            type: 'text',
            content: 'Los arrays y objetos son estructuras de datos fundamentales en JavaScript.'
          }
        ]
      },
      {
        id: 'js-4',
        title: 'DOM Manipulation',
        description: 'Interactúa con elementos HTML usando JavaScript',
        difficulty: 'hard',
        estimatedTime: 30,
        content: [
          {
            type: 'text',
            content: 'El DOM te permite modificar dinámicamente el contenido y estilo de una página web.'
          }
        ]
      },
      {
        id: 'js-5',
        title: 'Async/Await',
        description: 'Manejo de operaciones asíncronas',
        difficulty: 'hard',
        estimatedTime: 35,
        content: [
          {
            type: 'text',
            content: 'Async/await hace que el código asíncrono sea más legible y fácil de manejar.'
          }
        ]
      }
    ]
  },
  {
    id: 'react',
    title: 'React Development',
    description: 'Construye aplicaciones web modernas con React',
    color: 'from-blue-400 to-cyan-500',
    icon: '⚛️',
    levels: [
      {
        id: 'react-1',
        title: 'Componentes',
        description: 'Aprende a crear y usar componentes en React',
        difficulty: 'easy',
        estimatedTime: 20,
        content: [
          {
            type: 'text',
            content: 'Los componentes son la base de las aplicaciones React. Son como funciones que retornan JSX.'
          }
        ]
      },
      {
        id: 'react-2',
        title: 'Props y State',
        description: 'Maneja datos en tus componentes',
        difficulty: 'medium',
        estimatedTime: 25,
        content: [
          {
            type: 'text',
            content: 'Props y State son las formas principales de manejar datos en React.'
          }
        ]
      },
      {
        id: 'react-3',
        title: 'Hooks',
        description: 'Domina useState, useEffect y más',
        difficulty: 'hard',
        estimatedTime: 30,
        content: [
          {
            type: 'text',
            content: 'Los hooks permiten usar state y otras características de React en componentes funcionales.'
          }
        ]
      }
    ]
  },
  {
    id: 'css',
    title: 'CSS Mastery',
    description: 'Domina el diseño y estilizado web',
    color: 'from-pink-400 to-purple-500',
    icon: '🎨',
    levels: [
      {
        id: 'css-1',
        title: 'Selectores CSS',
        description: 'Aprende a seleccionar elementos HTML',
        difficulty: 'easy',
        estimatedTime: 15,
        content: [
          {
            type: 'text',
            content: 'Los selectores CSS te permiten aplicar estilos a elementos específicos del HTML.'
          }
        ]
      },
      {
        id: 'css-2',
        title: 'Flexbox',
        description: 'Diseña layouts flexibles',
        difficulty: 'medium',
        estimatedTime: 25,
        content: [
          {
            type: 'text',
            content: 'Flexbox es un sistema de layout unidimensional que hace fácil organizar elementos.'
          }
        ]
      },
      {
        id: 'css-3',
        title: 'Grid Layout',
        description: 'Crea layouts complejos con CSS Grid',
        difficulty: 'hard',
        estimatedTime: 35,
        content: [
          {
            type: 'text',
            content: 'CSS Grid es un sistema de layout bidimensional para crear diseños complejos.'
          }
        ]
      },
      {
        id: 'css-4',
        title: 'Animaciones',
        description: 'Añade vida a tus diseños',
        difficulty: 'hard',
        estimatedTime: 40,
        content: [
          {
            type: 'text',
            content: 'Las animaciones CSS pueden mejorar significativamente la experiencia del usuario.'
          }
        ]
      }
    ]
  }
];