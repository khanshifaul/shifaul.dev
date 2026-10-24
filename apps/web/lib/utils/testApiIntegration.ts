// API Integration Test Utility
// This file can be used to test the API integrations during development

import { contactAPI } from '@/lib/actions/contactApi';
import { projectsAPI } from '@/lib/actions/projectsApi';
import { blogAPI } from '@/lib/actions/blogApi';

export async function testContactAPI() {
  console.log('Testing Contact API...');
  try {
    // Test create contact message (this will actually send a message, so be careful)
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Message',
      message: 'This is a test message from the API integration test.'
    };
    
    const result = await contactAPI.createContactMessage(testData);
    console.log('Contact API test result:', result);
    return result;
  } catch (error) {
    console.error('Contact API test failed:', error);
    throw error;
  }
}

export async function testProjectsAPI() {
  console.log('Testing Projects API...');
  try {
    const result = await projectsAPI.getPublicProjects({
      page: 1,
      limit: 5
    });
    console.log('Projects API test result:', result);
    return result;
  } catch (error) {
    console.error('Projects API test failed:', error);
    throw error;
  }
}

export async function testBlogAPI() {
  console.log('Testing Blog API...');
  try {
    const result = await blogAPI.getPublicBlogPosts({
      page: 1,
      limit: 5
    });
    console.log('Blog API test result:', result);
    return result;
  } catch (error) {
    console.error('Blog API test failed:', error);
    throw error;
  }
}

export async function runAllTests() {
  console.log('Starting API Integration Tests...');
  
  try {
    // Test all APIs
    const [contactResult, projectsResult, blogResult] = await Promise.allSettled([
      testContactAPI(),
      testProjectsAPI(),
      testBlogAPI()
    ]);
    
    console.log('Test Results:');
    console.log('Contact API:', contactResult.status === 'fulfilled' ? '✅ PASSED' : '❌ FAILED');
    console.log('Projects API:', projectsResult.status === 'fulfilled' ? '✅ PASSED' : '❌ FAILED');
    console.log('Blog API:', blogResult.status === 'fulfilled' ? '✅ PASSED' : '❌ FAILED');
    
    if (contactResult.status === 'rejected') {
      console.error('Contact API Error:', contactResult.reason);
    }
    if (projectsResult.status === 'rejected') {
      console.error('Projects API Error:', projectsResult.reason);
    }
    if (blogResult.status === 'rejected') {
      console.error('Blog API Error:', blogResult.reason);
    }
    
    return {
      contactAPI: contactResult.status === 'fulfilled',
      projectsAPI: projectsResult.status === 'fulfilled',
      blogAPI: blogResult.status === 'fulfilled'
    };
  } catch (error) {
    console.error('API Integration Tests failed:', error);
    throw error;
  }
}