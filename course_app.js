const express = require('express');
const bodyParser= require('body-parser');
const app = express();

app.use(express.json());
app.use(bodyParser.json());
let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminAuthentication=(req,res,next)=>{
  const {username,password}=req.headers;
  const admin=ADMINS.find(a=>a.username===username && a.password===password);
  if(admin){
    next();
  }else{
    res.status(403).json({message:'Admin authenticationn failed'});
  }
}

const userAuthentication=(req,res,next)=>{
  const {username,password}=req.headers;
  const user=USERS.find(u=>u.username===username && u.password===password);
  if(user){
    req.user=user;
    next();
  }else{
    res.status(403).json({message:'User authentication failed'});
  }
}

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const admin = req.body;
  const existingAdmin = ADMINS.find(a=>a.username===admin.username);
  if(existingAdmin){
    res.status(403).json({message:'Admin already exists'})
  }else{
    ADMINS.push(admin);
    res.json({message:'Admin created successfully'});
  }
  
});

app.post('/admin/login',adminAuthentication,(req, res) => {
  // logic to log in admin
  res.json({message:'Logged in successfully'});
});

app.post('/admin/courses',adminAuthentication, (req, res) => {
  // logic to create a course
  const course=req.body;
  course.id=Date.now();
  COURSES.push(course);
  res.json({message:'Course created successfully',courseId:course.id});
});

app.put('/admin/courses/:courseId',adminAuthentication,(req, res) => {
  // logic to edit a course
  const courseId=parseInt(res.params.courseId);
  const course=COURSES.find(c=>c.id===courseId);
  if(course){
    Object.assign(course,req.body);
    res.json({message:'Course update successfully'});
  }else{
    res.status(404).json({message:'Course not found'});
  }
});

app.get('/admin/courses', adminAuthentication, (req, res) => {
  // logic to get all courses
  res.json({courses:COURSES});
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  const user={...req.body,purchasedCourse:[]};
  USERS.push(user);
  res.json({message:'User Created successfully'});
});

app.post('/users/login',userAuthentication, (req, res) => {
  // logic to log in user
 res.json({message:'Logged in successfully'});
});

app.get('/users/courses',userAuthentication, (req, res) => {
  // logic to list all courses
  let filteredCourses=COURSES.filter(c=>c.published);
  res.json({courses:filteredCourses});
});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
  const courseId=Number(req.params.courseId);
  const course=COURSES.find(c=>c.id===courseId && c.published);
  if(course){
    req.user.purchasedCourse.push(courseId);
    res.json({message:'Course purchased Successfully'});
  }else{
    res.status(404).json({message:'Course not found or not available'});
  }
});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses
  app.get('/users/purchasedCourses', userAuthentication, (req, res) => {
    const purchasedCourses = COURSES.filter(course => req.user.purchasedCourses.includes(course.id));
    res.json({ purchasedCourses });
  });
  
  

});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
